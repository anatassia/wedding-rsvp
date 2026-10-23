-- 0005_wishes.sql
-- Guestbook ("Ucapan"): guests leave a short public message. Same
-- open-access + service-role-only pattern as rsvps (0001/0002) — no
-- anon/authenticated policies, all access goes through the Vercel
-- Functions backend using the service_role key.

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

do $$
begin
  alter table public.wishes
    add constraint wishes_guest_name_check check (char_length(trim(guest_name)) between 1 and 100);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.wishes
    add constraint wishes_message_check check (char_length(trim(message)) between 1 and 500);
exception
  when duplicate_object then null;
end $$;

comment on table public.wishes is 'Public guestbook messages ("Ucapan"). Open-access: anyone with the site link can post, no moderation queue.';

create index if not exists wishes_created_at_idx on public.wishes (created_at desc);

alter table public.wishes enable row level security;
revoke all on public.wishes from anon, authenticated;

-- ---------------------------------------------------------------------------
-- fn_list_wishes: most recent messages first.
-- ---------------------------------------------------------------------------
create or replace function public.fn_list_wishes(p_limit integer default 50)
returns setof public.wishes
language sql
security definer
set search_path = public
as $$
  select *
  from public.wishes
  order by created_at desc
  limit greatest(least(coalesce(p_limit, 50), 100), 1);
$$;

revoke all on function public.fn_list_wishes(integer) from public;
grant execute on function public.fn_list_wishes(integer) to service_role;

-- ---------------------------------------------------------------------------
-- fn_create_wish: post a new guestbook message.
-- ---------------------------------------------------------------------------
create or replace function public.fn_create_wish(p_guest_name text, p_message text)
returns public.wishes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.wishes;
begin
  insert into public.wishes (guest_name, message)
  values (trim(p_guest_name), trim(p_message))
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.fn_create_wish(text, text) from public;
grant execute on function public.fn_create_wish(text, text) to service_role;
