-- 0003_admin_and_rate_limit.sql
-- Admin-only capacity/open-close function, plus a DB-backed rate limiter.
-- Vercel Functions are stateless across invocations (and multiple instances
-- can run concurrently), so an in-process counter cannot enforce a real
-- limit. A small shared table does, and it's already inside the same
-- transaction-friendly database the rest of the app uses.

create table if not exists public.rate_limits (
  rl_key text primary key,
  count integer not null default 0,
  window_start timestamptz not null default now()
);

alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Atomically increments the counter for rl_key, resetting it if the
-- window has elapsed, and returns whether this call is still within
-- p_max_count for the given p_window_seconds. One row lock per key means
-- concurrent requests for the same key are serialized, so the count is
-- exact even under load.
create or replace function public.fn_check_rate_limit(
  p_key text,
  p_max_count integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.rate_limits;
  v_allowed boolean;
begin
  insert into public.rate_limits (rl_key, count, window_start)
  values (p_key, 0, now())
  on conflict (rl_key) do nothing;

  select * into v_row from public.rate_limits where rl_key = p_key for update;

  if v_row.window_start < now() - (p_window_seconds || ' seconds')::interval then
    update public.rate_limits
    set count = 1, window_start = now()
    where rl_key = p_key;
    return true;
  end if;

  v_allowed := v_row.count < p_max_count;

  if v_allowed then
    update public.rate_limits set count = count + 1 where rl_key = p_key;
  end if;

  return v_allowed;
end;
$$;

revoke all on function public.fn_check_rate_limit(text, integer, integer) from public;
grant execute on function public.fn_check_rate_limit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------
-- fn_admin_set_event_date: close/reopen a date and/or change its capacity.
-- Rejects a capacity below current confirmed attendance so an organiser
-- can never silently overbook a date that's already full.
-- ---------------------------------------------------------------------------
create or replace function public.fn_admin_set_event_date(
  p_event_date_id uuid,
  p_capacity integer,
  p_is_open boolean
)
returns public.event_dates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_confirmed bigint;
  v_result public.event_dates;
begin
  perform 1 from public.event_dates where id = p_event_date_id for update;

  if not found then
    raise exception 'event_date_not_found';
  end if;

  if p_capacity is not null then
    select coalesce(sum(party_size), 0) into v_confirmed
    from public.rsvps
    where event_date_id = p_event_date_id
      and status = 'confirmed';

    if p_capacity < v_confirmed then
      raise exception 'capacity_below_confirmed_attendance';
    end if;
  end if;

  update public.event_dates
  set capacity = coalesce(p_capacity, capacity),
      is_open = coalesce(p_is_open, is_open)
  where id = p_event_date_id
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.fn_admin_set_event_date(uuid, integer, boolean) from public;
grant execute on function public.fn_admin_set_event_date(uuid, integer, boolean) to service_role;
