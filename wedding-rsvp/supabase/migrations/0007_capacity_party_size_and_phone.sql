-- RSVP rule update:
--   * both sessions have a capacity of 125
--   * each RSVP may include 1-5 people
--   * phone number is no longer collected
--   * booking management uses the random reference code only

do $$
begin
  if exists (
    select 1
    from public.rsvps
    where status = 'confirmed'
    group by event_date_id
    having sum(party_size) > 125
  ) then
    raise exception 'Cannot set capacity to 125: a session already has more than 125 confirmed guests';
  end if;
end $$;

update public.event_dates
set capacity = 125;

alter table public.rsvps
  alter column phone drop not null;

alter table public.rsvps
  drop constraint if exists rsvps_party_size_check;

alter table public.rsvps
  add constraint rsvps_party_size_check check (party_size between 1 and 5);

drop function if exists public.fn_create_rsvp(uuid, text, text, smallint, text, text);
drop function if exists public.fn_lookup_rsvp(text, text);
drop function if exists public.fn_update_rsvp(text, text, uuid, smallint, text, text);
drop function if exists public.fn_cancel_rsvp(text, text);

create or replace function public.fn_create_rsvp(
  p_event_date_id uuid,
  p_guest_name text,
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
  if p_party_size is null or p_party_size < 1 or p_party_size > 5 then
    raise exception 'party_size_out_of_range';
  end if;

  select capacity, is_open into v_capacity, v_is_open
  from public.event_dates
  where id = p_event_date_id
  for update;

  if v_capacity is null then raise exception 'event_date_not_found'; end if;
  if not v_is_open then raise exception 'event_date_closed'; end if;

  select coalesce(sum(party_size), 0) into v_confirmed
  from public.rsvps
  where event_date_id = p_event_date_id and status = 'confirmed';

  if v_confirmed + p_party_size > v_capacity then
    raise exception 'event_date_capacity_exceeded';
  end if;

  loop
    v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
    begin
      insert into public.rsvps (
        event_date_id, guest_name, phone, party_size, companion_names, notes,
        status, reference_code, updated_at
      ) values (
        p_event_date_id, p_guest_name, null, p_party_size, p_companion_names,
        p_notes, 'confirmed', v_code, now()
      )
      returning * into v_result;
      exit;
    exception when unique_violation then
      v_attempt := v_attempt + 1;
      if v_attempt >= 5 then raise exception 'reference_code_generation_failed'; end if;
    end;
  end loop;

  return v_result;
end;
$$;

create or replace function public.fn_lookup_rsvp(p_reference_code text)
returns public.rsvps
language sql
security definer
set search_path = public
as $$
  select * from public.rsvps
  where reference_code = upper(trim(p_reference_code))
  limit 1;
$$;

create or replace function public.fn_update_rsvp(
  p_reference_code text,
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
  v_result public.rsvps;
begin
  if p_party_size is null or p_party_size < 1 or p_party_size > 5 then
    raise exception 'party_size_out_of_range';
  end if;

  select * into v_existing
  from public.rsvps
  where reference_code = upper(trim(p_reference_code))
  for update;

  if v_existing.id is null then raise exception 'rsvp_not_found'; end if;
  if v_existing.status <> 'confirmed' then raise exception 'rsvp_cancelled'; end if;
  v_old_date_id := v_existing.event_date_id;

  perform id from public.event_dates
  where id in (p_event_date_id, v_old_date_id)
  order by id
  for update;

  select capacity, is_open into v_new_capacity, v_new_is_open
  from public.event_dates where id = p_event_date_id;

  if v_new_capacity is null then raise exception 'event_date_not_found'; end if;
  if not v_new_is_open then raise exception 'event_date_closed'; end if;

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

create or replace function public.fn_cancel_rsvp(p_reference_code text)
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
    and status = 'confirmed'
  returning * into v_result;

  if v_result.id is null then raise exception 'rsvp_not_found'; end if;
  return v_result;
end;
$$;

revoke all on function public.fn_create_rsvp(uuid, text, smallint, text, text) from public;
revoke all on function public.fn_lookup_rsvp(text) from public;
revoke all on function public.fn_update_rsvp(text, uuid, smallint, text, text) from public;
revoke all on function public.fn_cancel_rsvp(text) from public;

grant execute on function public.fn_create_rsvp(uuid, text, smallint, text, text) to service_role;
grant execute on function public.fn_lookup_rsvp(text) to service_role;
grant execute on function public.fn_update_rsvp(text, uuid, smallint, text, text) to service_role;
grant execute on function public.fn_cancel_rsvp(text) to service_role;

comment on table public.rsvps is
  'Open-access RSVPs, capacity-gated per session. Guests manage a booking using its random reference code.';
