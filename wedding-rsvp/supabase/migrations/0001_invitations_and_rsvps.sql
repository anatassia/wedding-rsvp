-- 0001_invitations_and_rsvps.sql
-- Additive migration against the project's existing schema. Inspected via
-- the live database before writing this: `event_dates`, `invitations` and
-- `rsvps` already exist, so this migration only ALTERs them — it does not
-- drop or recreate anything.
--
-- RSVP identity model: open access. Anyone with the site link can submit
-- an RSVP directly (gated only by remaining capacity) — there is no
-- invitation token to redeem. A guest's own booking is later found again
-- with the reference_code + phone number pair generated at submission
-- time, not by any pre-issued secret link. The `invitations` table from an
-- earlier iteration of this project is no longer used by the app; it is
-- left in place untouched (not dropped) since it may already hold rows,
-- and dropping it is unnecessary for anything below.

-- ---------------------------------------------------------------------------
-- 1. Correct existing event_dates data: the wedding is 26–27 December
--    2026 (not 2027), and the two dates have different venues.
--    (Update only — no deletes, no schema change to this table.)
-- ---------------------------------------------------------------------------
update public.event_dates
set event_date = '2026-12-26', venue = 'Kg Raja Gabus'
where event_date = '2027-12-26';

update public.event_dates
set event_date = '2026-12-27', venue = 'Kunang Sungai Petani'
where event_date = '2027-12-27';

do $$
begin
  alter table public.event_dates
    add constraint event_dates_event_date_unique unique (event_date);
exception
  when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- 2. rsvps: move from the invitation-token model to open-access +
--    reference_code. invitation_id is loosened (nullable) rather than
--    dropped — the table is currently empty, but loosening instead of
--    dropping keeps this migration safe even if that's no longer true by
--    the time it runs.
-- ---------------------------------------------------------------------------
-- This assumes `rsvps` already exists (confirmed via a live query before
-- writing this migration), so there is no `create table` fallback here —
-- a fresh project with no rsvps table at all would need a different
-- bootstrap migration.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'rsvps' and column_name = 'invitation_id'
  ) then
    alter table public.rsvps alter column invitation_id drop not null;
  end if;
end $$;
alter table public.rsvps add column if not exists reference_code text;
alter table public.rsvps add column if not exists notes text;
alter table public.rsvps add column if not exists updated_at timestamptz not null default now();
alter table public.rsvps add column if not exists cancelled_at timestamptz;

-- Backfill is a no-op on an empty table; guards against a future partial run.
update public.rsvps set reference_code = upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
where reference_code is null;

alter table public.rsvps alter column reference_code set not null;

do $$
begin
  alter table public.rsvps
    add constraint rsvps_reference_code_unique unique (reference_code);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.rsvps
    add constraint rsvps_party_size_check check (party_size between 1 and 3);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.rsvps
    add constraint rsvps_status_check check (status in ('confirmed', 'cancelled'));
exception
  when duplicate_object then null;
end $$;

comment on table public.rsvps is 'Open-access RSVPs, capacity-gated per event_date. A guest''s booking is found again via reference_code + phone, not any pre-issued link. status=cancelled releases capacity; the row is kept (not deleted).';
comment on column public.rsvps.invitation_id is 'Unused by the current (open-access) booking flow. Kept nullable rather than dropped.';

create index if not exists rsvps_event_date_id_idx on public.rsvps (event_date_id);
create index if not exists rsvps_status_idx on public.rsvps (status);
create index if not exists rsvps_reference_code_idx on public.rsvps (reference_code);
create index if not exists rsvps_phone_idx on public.rsvps (phone);
create index if not exists rsvps_guest_name_idx on public.rsvps using gin (to_tsvector('simple', guest_name));

-- ---------------------------------------------------------------------------
-- 3. Row Level Security.
--    All application access goes through Vercel Functions using the
--    Supabase service_role key (which bypasses RLS). No anon/authenticated
--    policies are defined, so direct client-side access to these tables is
--    denied entirely — guest lists can never leak via the client-side
--    Supabase SDK or REST API, and a visitor can only create or look up an
--    RSVP through the backend's RPC-calling endpoints, never by listing
--    the table directly.
-- ---------------------------------------------------------------------------
alter table public.rsvps enable row level security;
alter table public.event_dates enable row level security;
alter table public.invitations enable row level security;

revoke all on public.rsvps from anon, authenticated;
revoke all on public.event_dates from anon, authenticated;
revoke all on public.invitations from anon, authenticated;
