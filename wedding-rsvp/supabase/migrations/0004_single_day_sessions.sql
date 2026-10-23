-- 0004_single_day_sessions.sql
-- The wedding is now a single day (27 December 2026) with two RSVP
-- sessions at Kunang Sungai Petani, rather than two separate dates:
--   Session 1: 11:30am - 2:00pm
--   Session 2: 2:00pm  - 4:30pm
--
-- event_dates rows are reused as "sessions" (the app already models each
-- row as a date + start_time + end_time + venue + capacity, so no schema
-- change is needed). The old unique constraint only allowed one row per
-- event_date; it's replaced with one on (event_date, start_time) so two
-- sessions can share the same date.

alter table public.event_dates drop constraint if exists event_dates_event_date_unique;
alter table public.event_dates drop constraint if exists event_dates_event_date_key;

do $$
declare
  v_id1 uuid;
  v_id2 uuid;
begin
  select id into v_id1 from public.event_dates order by event_date asc limit 1;
  select id into v_id2 from public.event_dates order by event_date asc offset 1 limit 1;

  if v_id1 is not null then
    update public.event_dates
    set event_date = '2026-12-27', venue = 'Kunang Sungai Petani',
        start_time = '11:30', end_time = '14:00'
    where id = v_id1;
  end if;

  if v_id2 is not null then
    update public.event_dates
    set event_date = '2026-12-27', venue = 'Kunang Sungai Petani',
        start_time = '14:00', end_time = '16:30'
    where id = v_id2;
  end if;
end $$;

do $$
begin
  alter table public.event_dates
    add constraint event_dates_date_start_time_unique unique (event_date, start_time);
exception
  when duplicate_object then null;
end $$;
