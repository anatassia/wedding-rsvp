-- Rename the wedding venue without changing either session's date or time.
-- Safe to run more than once.
update public.event_dates
set venue = 'KUNANG-KUNANG'
where lower(trim(venue)) in (
  'kunag',
  'kunang kunang',
  'kunang-kunang',
  'kunang sungai petani',
  'kunang-kunang sungai petani'
);
