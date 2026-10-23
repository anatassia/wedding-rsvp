-- 0002_booking_functions.sql
-- Transactional booking logic for the open-access RSVP model: anyone with
-- the site link can submit, gated only by remaining capacity. A booking is
-- found again later with reference_code + phone, not any secret link.
--
-- Each function is one Postgres transaction (atomic by default; any
-- exception rolls everything back) with explicit row locking so
-- concurrent requests can't both take the last place. All are SECURITY
-- DEFINER but execution is revoked from anon/authenticated and granted
-- only to service_role — the Vercel Functions backend is the only caller,
-- using the service_role key, never the frontend directly.

create or replace function public.fn_public_event_dates()
returns table (
  id uuid,
  event_date date,
  venue text,
  start_time time,
  end_time time,
  capacity integer,
  is_open boolean,
  confirmed_count bigint,
  remaining integer
)
language sql
security definer
set search_path = public
as $$
  select
    d.id,
    d.event_date,
    d.venue,
    d.start_time,
    d.end_time,
    d.capacity,
    d.is_open,
    coalesce(r.confirmed_count, 0) as confirmed_count,
    greatest(d.capacity - coalesce(r.confirmed_count, 0), 0)::int as remaining
  from public.event_dates d
  left join (
    select event_date_id, sum(party_size) as confirmed_count
    from public.rsvps
    where status = 'confirmed'
    group by event_date_id
  ) r on r.event_date_id = d.id
  order by d.event_date asc;
$$;

comment on function public.fn_public_event_dates() is
  'Public-safe listing of wedding dates with computed availability. Exposes no guest data.';

revoke all on function public.fn_public_event_dates() from public;
grant execute on function public.fn_public_event_dates() to service_role;

-- ---------------------------------------------------------------------------
-- fn_create_rsvp: create a brand-new RSVP. No pre-issued token or code is
-- required to call this — only remaining capacity on the chosen date.
-- ---------------------------------------------------------------------------
create or replace function public.fn_create_rsvp(
  p_event_date_id uuid,
  p_guest_name text,
  p_phone text,
  p_party_size smallint,
  p_companion_names text,
  p_notes text
)
returns public.rsvps
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity integer;
  v_is_open boolean;
  v_confirmed bigint;
  v_code text;
  v_attempt int := 0;
  v_result public.rsvps;
begin
  if p_party_size is null or p_party_size < 1 or p_party_size > 3 then
    raise exception 'party_size_out_of_range';
  end if;

  select capacity, is_open into v_capacity, v_is_open
  from public.event_dates
  where id = p_event_date_id
  for update;

  if v_capacity is null then
    raise exception 'event_date_not_found';
  end if;

  if not v_is_open then
    raise exception 'event_date_closed';
  end if;

  select coalesce(sum(party_size), 0) into v_confirmed
  from public.rsvps
  where event_date_id = p_event_date_id
    and status = 'confirmed';

  if v_confirmed + p_party_size > v_capacity then
    raise exception 'event_date_capacity_exceeded';
  end if;

  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    begin
      insert into public.rsvps (
        event_date_id, guest_name, phone, party_size, companion_names, notes,
        status, reference_code, updated_at
      )
      values (
        p_event_date_id, p_guest_name, p_phone, p_party_size, p_companion_names,
        p_notes, 'confirmed', v_code, now()
      )
      returning * into v_result;
      exit;
    exception
      when unique_violation then
        v_attempt := v_attempt + 1;
        if v_attempt >= 5 then
          raise exception 'reference_code_generation_failed';
        end if;
    end;
  end loop;

  return v_result;
end;
$$;

revoke all on function public.fn_create_rsvp(uuid, text, text, smallint, text, text) from public;
grant execute on function public.fn_create_rsvp(uuid, text, text, smallint, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- fn_lookup_rsvp: find a booking by reference_code + phone (case/whitespace
-- insensitive on phone). Used by the "Semak / Ubah RSVP" flow.
-- ---------------------------------------------------------------------------
create or replace function public.fn_lookup_rsvp(p_reference_code text, p_phone text)
returns public.rsvps
language sql
security definer
set search_path = public
as $$
  select *
  from public.rsvps
  where reference_code = upper(trim(p_reference_code))
    and regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace(p_phone, '[^0-9]', '', 'g')
  limit 1;
$$;

revoke all on function public.fn_lookup_rsvp(text, text) from public;
grant execute on function public.fn_lookup_rsvp(text, text) to service_role;

-- ---------------------------------------------------------------------------
-- fn_update_rsvp: change date, party size, companion names and/or notes on
-- an existing confirmed booking, verified by reference_code + phone.
-- ---------------------------------------------------------------------------
create or replace function public.fn_update_rsvp(
  p_reference_code text,
  p_phone text,
  p_event_date_id uuid,
  p_party_size smallint,
  p_companion_names text,
  p_notes text
)
returns public.rsvps
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.rsvps;
  v_old_date_id uuid;
  v_new_capacity integer;
  v_new_is_open boolean;
  v_confirmed_excl_self bigint;
  v_lock_ids uuid[];
  v_result public.rsvps;
begin
  if p_party_size is null or p_party_size < 1 or p_party_size > 3 then
    raise exception 'party_size_out_of_range';
  end if;

  select * into v_existing
  from public.rsvps
  where reference_code = upper(trim(p_reference_code))
    and regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace(p_phone, '[^0-9]', '', 'g')
  for update;

  if v_existing.id is null then
    raise exception 'rsvp_not_found';
  end if;

  if v_existing.status <> 'confirmed' then
    raise exception 'rsvp_cancelled';
  end if;

  v_old_date_id := v_existing.event_date_id;

  -- Lock old + new event_date rows in a consistent (id) order so two
  -- requests swapping between the same two dates can never deadlock.
  select array_agg(id order by id) into v_lock_ids
  from public.event_dates
  where id in (p_event_date_id, v_old_date_id)
  for update;

  select capacity, is_open into v_new_capacity, v_new_is_open
  from public.event_dates
  where id = p_event_date_id;

  if v_new_capacity is null then
    raise exception 'event_date_not_found';
  end if;

  if not v_new_is_open then
    raise exception 'event_date_closed';
  end if;

  select coalesce(sum(party_size), 0) into v_confirmed_excl_self
  from public.rsvps
  where event_date_id = p_event_date_id
    and status = 'confirmed'
    and id <> v_existing.id;

  if v_confirmed_excl_self + p_party_size > v_new_capacity then
    raise exception 'event_date_capacity_exceeded';
  end if;

  update public.rsvps
  set event_date_id = p_event_date_id,
      party_size = p_party_size,
      companion_names = p_companion_names,
      notes = p_notes,
      updated_at = now()
  where id = v_existing.id
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.fn_update_rsvp(text, text, uuid, smallint, text, text) from public;
grant execute on function public.fn_update_rsvp(text, text, uuid, smallint, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- fn_cancel_rsvp: cancel a booking, verified by reference_code + phone.
-- ---------------------------------------------------------------------------
create or replace function public.fn_cancel_rsvp(p_reference_code text, p_phone text)
returns public.rsvps
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result public.rsvps;
begin
  update public.rsvps
  set status = 'cancelled', cancelled_at = now(), updated_at = now()
  where reference_code = upper(trim(p_reference_code))
    and regexp_replace(phone, '[^0-9]', '', 'g') = regexp_replace(p_phone, '[^0-9]', '', 'g')
    and status = 'confirmed'
  returning * into v_result;

  if v_result.id is null then
    raise exception 'rsvp_not_found';
  end if;

  return v_result;
end;
$$;

revoke all on function public.fn_cancel_rsvp(text, text) from public;
grant execute on function public.fn_cancel_rsvp(text, text) to service_role;
