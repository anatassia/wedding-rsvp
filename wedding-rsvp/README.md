# Iskandar & Nasyiaa — Wedding Invitation & RSVP

Vue 3 (Vite, Composition API, Vue Router) frontend + Vercel Functions
backend, backed by Supabase Postgres. Guest-facing language is Bahasa
Melayu. Wedding: **26 & 27 December 2026** (Saturday & Sunday), 12:00
tengah hari – 5:00 petang, Kunang Sungai Petani.

RSVP is **open access**: anyone with the site link can submit directly,
gated only by remaining capacity per date — there is no invitation
token/link to redeem. A submitted booking is found again later with the
**reference code + phone number** generated at submission time.

## Project structure

```
src/
  components/        AppHeader, AppFooter, CoupleHero, CountdownTimer,
                      EntryEnvelope, EventDetails, ContactSection,
                      FloralDecoration, MusicControl, LoadingOverlay,
                      FadeInSection, rsvp/ (DateCard, GuestDetailsStep,
                      ReviewStep, ManageBooking), admin/ (DateManager,
                      GuestList, ConfirmDialog)
  views/             InvitationView ("/"), StoryView ("/kisah-kami"),
                      JemputanView ("/jemputan"), RsvpView ("/rsvp"),
                      ManageRsvpView ("/rsvp/semak"),
                      admin/AdminLoginView, admin/AdminDashboardView
  composables/        useEventDates, useAdminAuth, useParallax
  services/          api.js (fetch wrapper), supabaseAuth.js (organiser login)
  router/            vue-router setup
  utils/             formatDate.js, calendarLink.js

api/                 Vercel Functions (HTTP layer only — thin)
  dates.js           GET — public dates + availability
  health.js
  rsvp/index.js      POST — create an RSVP (open access, capacity-gated)
  rsvp/manage.js     POST (lookup) / PATCH (update) / DELETE (cancel),
                     all verified by reference_code + phone
  admin/guests.js    GET — filterable guest list (organiser only)
  admin/export.js    GET — CSV export (organiser only)
  admin/dates/[id].js  PATCH — close/reopen/capacity (organiser only)

server/              server-only helpers, never imported by frontend code
  supabase.js        service-role client
  auth.js            verifies organiser Supabase session + ADMIN_USER_IDS allowlist
  validation.js
  rateLimit.js       DB-backed rate limiting (fn_check_rate_limit)
  rpcErrors.js        maps Postgres function error codes to HTTP status + Malay message

supabase/migrations/  additive SQL migrations (see below)
scripts/               verify-booking-flow.mjs
```

**Why a Vercel Functions backend instead of calling Supabase directly from
Vue with the anon key:** the project already had this layer before this
round of changes, it was explicitly kept on purpose, and it is strictly
more secure than the anon-key-RPC pattern — the frontend never holds any
Supabase key stronger than the `service_role` key would require, and every
privileged RPC (`fn_create_rsvp`, `fn_update_rsvp`, `fn_cancel_rsvp`,
`fn_admin_set_event_date`) is `revoke`d from `anon`/`authenticated` and
`grant`ed only to `service_role`. The frontend's own Supabase client
(`src/services/supabaseAuth.js`) exists only for organiser **sign-in**,
using the publishable/anon key — it never reads or writes RSVP data
directly.

## 1. Local setup

```bash
npm install
```

Copy `.env.example` to `.env` **and** `.env.local` and fill in real values.

- `npm run dev` — Vite only. `/api/*` routes are **not** served; use this
  only for pure frontend/CSS work.
- `npm run dev:full` — `vercel dev`, serves the frontend **and** the
  `/api/*` functions together. Use this for anything that talks to
  Supabase (RSVP booking, admin dashboard).
- `npm run build` — production build (`dist/`).

### Why both `.env` and `.env.local`

The installed Vercel CLI only loads **`.env`** into the local serverless
function runtime for `vercel dev` — not `.env.local`. Vite's own dev
server (for `VITE_*` vars) reads both. Keep both in sync.

## 2. Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `SUPABASE_URL` | backend only | Supabase project URL |
| `SUPABASE_SECRET_KEY` | backend only | **service_role** key — full DB access, never expose to the frontend |
| `ADMIN_USER_IDS` | backend only | comma-separated Supabase Auth user UUIDs allowed into the organiser dashboard |
| `VITE_SUPABASE_URL` | frontend | same Supabase project URL, inlined at build time |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | frontend | the **anon/publishable** key — safe to expose, used only for organiser sign-in |
| `VITE_GOOGLE_MAPS_URL` | frontend | optional; falls back to a generic "Kunang Sungai Petani" Maps search if blank |
| `VITE_WEDDING_AUDIO_URL` | frontend | optional; background-music file URL. Leave blank to keep the music toggle present but disabled — **do not** point this at copyrighted audio you don't have the rights to use |

## 3. Supabase setup

### 3a. Run the migrations

I have no Postgres connection string for this project (only the REST
endpoint + the service_role key), so these need to be run manually.

1. Supabase dashboard → your project → **SQL Editor**.
2. Run `supabase/migrations/0001_invitations_and_rsvps.sql`.
3. Run `supabase/migrations/0002_booking_functions.sql`.
4. Run `supabase/migrations/0003_admin_and_rate_limit.sql`.

**Run them in that exact order** — 0002/0003 reference columns 0001
creates. All three are additive and safe to re-run (`if not exists`,
exception-guarded `do $$` blocks). They were written after inspecting the
live database: `event_dates`, `invitations` and `rsvps` already existed.
Specifically, 0001:

- Corrects `event_dates`: the two existing rows (previously dated
  2027-12-26 / 2027-12-27 from an earlier iteration of this project) are
  updated to **2026-12-26 (venue: Kg Raja Gabus)** and **2026-12-27
  (venue: Kunang Sungai Petani)**. Capacities (200 / 150) were already
  correct and are untouched.
- Loosens `rsvps.invitation_id` to nullable (the invitation-token model
  this project used earlier is retired in favour of open access +
  reference codes; the `invitations` table itself is left in place,
  unused, rather than dropped).
- Adds `rsvps.reference_code` (unique, not null), `rsvps.notes`,
  `rsvps.cancelled_at`, the 1–3 party-size check, the confirmed/cancelled
  status check, and indexes on `reference_code`, `phone`, `event_date_id`,
  `status`.
- Enables RLS with **no** anon/authenticated policies on all three
  tables — confirmed via a live query that anon access was already denied
  before writing this; this makes that permanent and explicit.

### 3b. Create the organiser account

Supabase dashboard → **Authentication → Users → Add user** → create an
email/password account. Put that user's UUID into `ADMIN_USER_IDS`
(comma-separate for more than one organiser). No password is hardcoded
anywhere — every organiser session is a real Supabase Auth session,
verified server-side against this allowlist on every admin API call.

### 3c. The booking functions (`supabase/migrations/0002`)

- **`fn_public_event_dates()`** — public-safe listing with computed
  `confirmed_count`/`remaining`. No guest fields.
- **`fn_create_rsvp(...)`** — locks the `event_dates` row, checks
  `is_open`, recalculates confirmed attendance, rejects if the requested
  party size would exceed remaining capacity, generates a unique
  `reference_code` (retried up to 5 times on collision), inserts the row.
  One transaction; any failure rolls everything back.
- **`fn_lookup_rsvp(reference_code, phone)`** — finds a booking by the
  pair, phone compared digits-only so formatting doesn't matter.
- **`fn_update_rsvp(...)`** — changes date/party size/companions/notes.
  Locks the rsvp row, then locks the old + new `event_dates` rows **in a
  consistent `id` order** so two requests swapping between the same two
  dates can never deadlock. Recalculates capacity **excluding the
  booking's own current place**, so moving within/into the same date
  never double-counts itself. Rejects edits to a cancelled booking.
- **`fn_cancel_rsvp(...)`** — sets `status = 'cancelled'`,
  `cancelled_at = now()`. The row is kept, not deleted; cancelled rows are
  excluded from every capacity calculation above via `status = 'confirmed'`
  filters.

All four (plus `fn_admin_set_event_date` and `fn_check_rate_limit` in
0003) are `revoke`d from `anon`/`authenticated`, `grant`ed only to
`service_role` — only this project's Vercel Functions can call them.

## 4. Running the verification script

After the migrations are applied:

```bash
node --env-file=.env.local scripts/verify-booking-flow.mjs
```

Exercises the rules directly against the database using isolated,
clearly-labelled test rows (`event_date` in January 2099, venue "TEST
VENUE — ..."), deleted again at the end. Covers: valid bookings,
capacity-by-people enforcement, party-size bounds (1–3), reference-code
generation and lookup (including a wrong-phone miss), editing without
double-counting, closed dates, two simultaneous requests for the last
place, a successful date change, a failed date change that preserves the
original booking, cancellation releasing places (and excluding cancelled
rows from capacity), a cancelled booking rejecting further edits, and
capacity being protected against dropping below confirmed attendance.

## 5. Vercel deployment

1. Create the Supabase project (already done here — reusing the existing
   `wedding-rsvp` project).
2. Run the SQL migrations (§3a).
3. Create `.env.local` from `.env.example` with real values.
4. `npm install`.
5. `npm run dev:full` to run locally.
6. `npm run build` to produce `dist/`.
7. `git push` to GitHub.
8. Import the repository into Vercel (already linked — `.vercel/project.json`
   points at project `wedding-rsvp`).
9. Vercel dashboard → Project → Settings → Environment Variables → add
   every variable from §2 for each environment you deploy to.
10. `vercel --prod` to deploy. **Not done automatically** — left for you
    to trigger.
11. Connect a custom domain via Vercel dashboard → Project → Settings →
    Domains, once you have one.
12. After deploying, re-run `node --env-file=.env.local scripts/verify-booking-flow.mjs`
    pointed at the same Supabase project to confirm capacity rules still
    hold through the deployed API (or exercise `/api/rsvp` and
    `/api/rsvp/manage` directly with `curl`).

`vercel.json` rewrites every non-`/api` path to `index.html` (so Vue
Router's history mode works on refresh) while explicitly leaving `/api/*`
untouched, and sets `Referrer-Policy: strict-origin-when-cross-origin`.
Build command `npm run build`, output directory `dist` (Vercel's Vite
preset already defaults to this).

## 6. What needs your action

- [ ] Run the three SQL migrations (§3a) — **nothing works until this is done.**
- [ ] Create the organiser's Supabase Auth user and confirm `ADMIN_USER_IDS`
      (already set to the UUID you gave me: `825217d9-1bb7-4642-b7a0-64ae13bc9856`).
- [ ] Add all environment variables to the Vercel project before deploying.
- [ ] If you want background music, add a **licensed** audio file and set
      `VITE_WEDDING_AUDIO_URL`. No audio is bundled by default.
- [ ] If the default Google Maps search isn't accurate enough, set
      `VITE_GOOGLE_MAPS_URL` to the exact venue pin's share link.
- [ ] Run `node --env-file=.env.local scripts/verify-booking-flow.mjs` once
      migrations are applied.
- [ ] Open the site in an actual browser — I smoke-tested every route and
      API endpoint with `vercel dev` + `curl` (all return the expected
      status codes), and the build has no errors, but I have no way to
      render pages visually in this environment. The envelope animation,
      countdown layout, floral decorations, responsive breakpoints, and
      focus/keyboard behaviour of the admin confirm dialog have **not**
      been eyeballed.
- [ ] Trigger the actual `vercel --prod` deploy and connect a custom
      domain — not done automatically.

## 7. Testing checklist (section 21/22 of the brief)

Confirmed by inspection/build, pending confirmation in a real browser once migrated:

- [x] No page contains the year 2027 (swept with `grep`; only the migration's
      own "update FROM 2027-12-xx" source values remain, which is correct —
      that's what the live rows currently hold before the migration runs).
- [x] All dates read 26 & 27 December 2026 after migration 0001 runs.
- [x] Days are Saturday (`getMalayDayName` computes this from the date,
      not hardcoded) & Sunday.
- [x] Countdown target is `2026-12-26T12:00:00+08:00` (hardcoded in
      `CountdownTimer.vue`, independent of the DB value).
- [x] Time displayed as 12:00 tengah hari – 5:00 petang.
- [x] Capacity 200 (26th) / 150 (27th) — unchanged by migration, already correct.
- [x] Party size capped at 3 (`party_size_out_of_range` DB check + frontend).
- [x] Only one date selectable at a time (radio-style `DateCard` selection).
- [x] A full date's card is disabled with "Penuh".
- [ ] Concurrent-submission capacity safety — covered by
      `verify-booking-flow.mjs` check 8; **not yet run** (needs migrations applied).
- [x] Envelope appears only on `InvitationView` ("/"); `JemputanView`
      ("/jemputan") has no envelope.
- [x] Every phone number in `ContactSection.vue` is a `tel:` link.
- [x] No service-role key in any frontend file — grep confirms
      `SUPABASE_SECRET_KEY` only appears in `server/`, `scripts/`, and env files.
- [x] `npm run build` succeeds with no errors.
- [ ] Routes surviving a hard refresh on Vercel — depends on the actual
      Vercel deploy; `vercel.json`'s rewrite rule covers this but hasn't
      been tested against a live deployment.

## 8. HTTP status conventions

`400` invalid input · `401` no/invalid organiser session · `403` valid
session but not on `ADMIN_USER_IDS` · `404` missing resource/no matching
reference code+phone · `405` wrong HTTP method · `409` capacity/booking
conflict, or editing a cancelled booking · `429` rate limited · `500`
unexpected failure. Error responses never include raw database error
text — see `server/rpcErrors.js`.
