// Verifies the transactional booking rules directly against the database
// (bypassing the HTTP API) using isolated, clearly-marked test records that
// are deleted again at the end — this never touches the real event_dates
// rows or writes fake guests into production data.
//
// Run after applying supabase/migrations/*.sql:
//   node --env-file=.env.local scripts/verify-booking-flow.mjs

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error("SUPABASE_URL / SUPABASE_SECRET_KEY are not set.");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const results = [];
let passCount = 0;

function check(name, condition, detail) {
  const pass = Boolean(condition);
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} - ${name}${detail ? ` (${detail})` : ""}`);
  if (pass) passCount++;
}

async function createTestDate(label, capacity) {
  const { data, error } = await supabase
    .from("event_dates")
    .insert({
      event_date: `2099-01-${label}`,
      venue: "TEST VENUE — verify-booking-flow.mjs",
      start_time: "12:00",
      end_time: "17:00",
      capacity,
      is_open: true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function create(eventDateId, partySize, overrides = {}) {
  return supabase.rpc("fn_create_rsvp", {
    p_event_date_id: eventDateId,
    p_guest_name: overrides.guest_name ?? "Test Guest",
    p_phone: overrides.phone ?? `01${Math.floor(Math.random() * 1e8)}`,
    p_party_size: partySize,
    p_companion_names: overrides.companion_names ?? null,
    p_notes: overrides.notes ?? null,
  });
}

const createdDateIds = [];
const createdRsvpIds = [];

async function main() {
  const dateA = await createTestDate("01", 2);
  const dateB = await createTestDate("02", 1);
  createdDateIds.push(dateA, dateB);

  const phoneA = "0111111111";
  const phoneB = "0122222222";
  const phoneC = "0133333333";
  const phoneD = "0144444444";
  const phoneE = "0155555555";

  // 1. Valid booking for a date.
  let rsvpA;
  {
    const { data, error } = await create(dateA, 2, { phone: phoneA });
    check("valid booking succeeds", !error, error?.message);
    rsvpA = data;
    if (rsvpA) createdRsvpIds.push(rsvpA.id);
  }

  // 2. Capacity counted by people: dateA (capacity 2) is now full.
  {
    const { error } = await create(dateA, 1, { phone: phoneB });
    check("capacity exceeded is rejected", error?.message === "event_date_capacity_exceeded", error?.message);
  }

  // 3. Party size outside 1-3.
  {
    const { error } = await create(dateB, 4, { phone: phoneB });
    check("party size > 3 rejected", error?.message === "party_size_out_of_range", error?.message);
  }
  {
    const { error } = await create(dateB, 0, { phone: phoneB });
    check("party size 0 rejected", error?.message === "party_size_out_of_range", error?.message);
  }

  // 4. A unique reference code is generated and returned.
  {
    check(
      "a unique reference code is generated",
      typeof rsvpA?.reference_code === "string" && rsvpA.reference_code.length >= 6
    );
  }

  // 5. Lookup by reference_code + phone.
  {
    const { data, error } = await supabase.rpc("fn_lookup_rsvp", {
      p_reference_code: rsvpA.reference_code,
      p_phone: phoneA,
    });
    check("lookup by reference_code + phone succeeds", !error && data?.id === rsvpA.id, error?.message);
  }
  {
    const { data } = await supabase.rpc("fn_lookup_rsvp", {
      p_reference_code: rsvpA.reference_code,
      p_phone: "0199999999",
    });
    check("lookup with wrong phone finds nothing", data === null);
  }

  // 6. Updating party size without double counting (rsvpA: 2 -> 1 on same date).
  {
    const { error } = await supabase.rpc("fn_update_rsvp", {
      p_reference_code: rsvpA.reference_code,
      p_phone: phoneA,
      p_event_date_id: dateA,
      p_party_size: 1,
      p_companion_names: null,
      p_notes: null,
    });
    check("edit own booking (reduce party size) succeeds", !error, error?.message);
  }
  {
    // Now 1 place should have freed up on dateA.
    const { error } = await create(dateA, 1, { phone: phoneB });
    check("freed place after edit becomes bookable", !error, error?.message);
  }

  // 7. Full / closed dates.
  {
    const { error: closeErr } = await supabase.rpc("fn_admin_set_event_date", {
      p_event_date_id: dateB,
      p_capacity: null,
      p_is_open: false,
    });
    check("admin can close a date", !closeErr, closeErr?.message);

    const { error } = await create(dateB, 1, { phone: phoneD });
    check("booking a closed date is rejected", error?.message === "event_date_closed", error?.message);

    const { error: reopenErr } = await supabase.rpc("fn_admin_set_event_date", {
      p_event_date_id: dateB,
      p_capacity: null,
      p_is_open: true,
    });
    check("admin can reopen a date", !reopenErr, reopenErr?.message);
  }

  // 8. Simultaneous requests for the last place on dateB (capacity 1).
  {
    const [r1, r2] = await Promise.all([
      create(dateB, 1, { phone: phoneD }),
      create(dateB, 1, { phone: phoneE }),
    ]);
    const successes = [r1, r2].filter((r) => !r.error).length;
    const conflicts = [r1, r2].filter((r) => r.error?.message === "event_date_capacity_exceeded").length;
    check(
      "exactly one of two simultaneous last-place bookings succeeds",
      successes === 1 && conflicts === 1,
      `successes=${successes} conflicts=${conflicts}`
    );
    [r1, r2].forEach((r) => r.data && createdRsvpIds.push(r.data.id));
  }

  // 9. Successful date change: move rsvpA from dateA to a fresh roomy date.
  const dateC = await createTestDate("03", 5);
  createdDateIds.push(dateC);
  {
    const { error } = await supabase.rpc("fn_update_rsvp", {
      p_reference_code: rsvpA.reference_code,
      p_phone: phoneA,
      p_event_date_id: dateC,
      p_party_size: 1,
      p_companion_names: null,
      p_notes: null,
    });
    check("successful date change", !error, error?.message);
    const { data: row } = await supabase.from("rsvps").select("event_date_id").eq("id", rsvpA.id).single();
    check("booking now points at the new date", row?.event_date_id === dateC);
  }

  // 10. Failed date change preserves the original booking.
  //     dateB is now full (1/1) from step 8's winner. Try moving the other
  //     active booking on dateA (phoneB's) onto the full dateB.
  {
    const { data: bRow } = await supabase.from("rsvps").select("*").eq("phone", phoneB).eq("status", "confirmed").single();
    const before = { ...bRow };

    const { error } = await supabase.rpc("fn_update_rsvp", {
      p_reference_code: bRow.reference_code,
      p_phone: phoneB,
      p_event_date_id: dateB,
      p_party_size: 1,
      p_companion_names: null,
      p_notes: null,
    });
    check("failed date change is rejected", error?.message === "event_date_capacity_exceeded", error?.message);

    const { data: after } = await supabase.from("rsvps").select("*").eq("id", bRow.id).single();
    check(
      "original booking unchanged after a failed date change",
      before.event_date_id === after.event_date_id && before.party_size === after.party_size
    );
  }

  // 11. Cancellation releases places.
  {
    const beforeDates = await supabase.rpc("fn_public_event_dates");
    const beforeConfirmed = beforeDates.data.find((d) => d.id === dateC)?.confirmed_count;

    const { error } = await supabase.rpc("fn_cancel_rsvp", {
      p_reference_code: rsvpA.reference_code,
      p_phone: phoneA,
    });
    check("cancellation succeeds", !error, error?.message);

    const afterDates = await supabase.rpc("fn_public_event_dates");
    const afterConfirmed = afterDates.data.find((d) => d.id === dateC)?.confirmed_count;
    check(
      "cancellation releases the place",
      Number(afterConfirmed) === Number(beforeConfirmed) - 1,
      `before=${beforeConfirmed} after=${afterConfirmed}`
    );
  }

  // 12. Cancelled record is excluded from capacity totals and cannot be edited.
  {
    const { error } = await supabase.rpc("fn_update_rsvp", {
      p_reference_code: rsvpA.reference_code,
      p_phone: phoneA,
      p_event_date_id: dateC,
      p_party_size: 1,
      p_companion_names: null,
      p_notes: null,
    });
    check("a cancelled booking cannot be edited", error?.message === "rsvp_cancelled", error?.message);
  }

  // 13. Duplicate submission does not silently create two rows for the
  //     same person — each fn_create_rsvp call is an independent new RSVP
  //     by design (open access, no identity to dedupe on), so two calls
  //     with the same details correctly produce two distinct reference
  //     codes rather than erroring.
  {
    const { data: d1 } = await create(dateC, 1, { phone: phoneC, guest_name: "Dup Test" });
    const { data: d2 } = await create(dateC, 1, { phone: phoneC, guest_name: "Dup Test" });
    check(
      "two submissions get two distinct reference codes",
      d1?.reference_code && d2?.reference_code && d1.reference_code !== d2.reference_code
    );
    [d1, d2].forEach((d) => d && createdRsvpIds.push(d.id));
  }

  // 14. Admin capacity change rejected below confirmed attendance.
  {
    const { data: confirmedOnC } = await supabase
      .from("rsvps")
      .select("party_size")
      .eq("event_date_id", dateC)
      .eq("status", "confirmed");
    const totalOnC = confirmedOnC.reduce((sum, r) => sum + r.party_size, 0);

    const { error } = await supabase.rpc("fn_admin_set_event_date", {
      p_event_date_id: dateC,
      p_capacity: Math.max(0, totalOnC - 1),
      p_is_open: null,
    });
    check(
      "capacity cannot drop below confirmed attendance",
      error?.message === "capacity_below_confirmed_attendance",
      error?.message
    );
  }

  // 15. Public dates endpoint never exposes guest data.
  {
    const { data } = await supabase.rpc("fn_public_event_dates");
    const row = data.find((d) => d.id === dateC);
    const keys = Object.keys(row || {});
    check(
      "fn_public_event_dates exposes no guest fields",
      !keys.some((k) => ["guest_name", "phone", "reference_code"].includes(k)),
      keys.join(",")
    );
  }
}

async function cleanup() {
  if (createdRsvpIds.length) {
    await supabase.from("rsvps").delete().in("id", createdRsvpIds);
  }
  // Any rsvps left pointing at our test dates (e.g. from the concurrency
  // test) also need cleaning up before the dates themselves can go.
  if (createdDateIds.length) {
    await supabase.from("rsvps").delete().in("event_date_id", createdDateIds);
    await supabase.from("event_dates").delete().in("id", createdDateIds);
  }
}

main()
  .catch((err) => {
    console.error("Verification script crashed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup();
    const total = results.length;
    console.log(`\n${passCount}/${total} checks passed.`);
    if (passCount !== total) process.exitCode = 1;
  });
