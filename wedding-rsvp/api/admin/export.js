import { getSupabaseAdmin } from "../../server/supabase.js";
import { requireOrganiser } from "../../server/auth.js";
import { isValidUuid, csvSafeCell } from "../../server/validation.js";
import { fetchGuestRows } from "./guests.js";

const HEADERS = [
  "reference_code",
  "guest_name",
  "phone",
  "party_size",
  "companion_names",
  "notes",
  "event_date",
  "start_time",
  "end_time",
  "venue",
  "status",
  "created_at",
];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const auth = await requireOrganiser(req);
  if (auth.error === "unauthenticated") {
    return res.status(401).json({ success: false, message: "Sign in required" });
  }
  if (auth.error === "forbidden") {
    return res.status(403).json({ success: false, message: "Not authorised" });
  }

  const { search, date_id, status } = req.query;

  if (date_id && !isValidUuid(date_id)) {
    return res.status(400).json({ success: false, message: "Invalid date filter" });
  }
  if (status && !["confirmed", "cancelled"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status filter" });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(500).json({ success: false, message: "Supabase environment variables are missing" });
  }

  const { data, error } = await fetchGuestRows(supabase, {
    search: typeof search === "string" ? search : "",
    eventDateId: date_id,
    status,
  });

  if (error) {
    return res.status(500).json({ success: false, message: "Unable to load guest list" });
  }

  const rows = data.map((row) =>
    [
      row.reference_code,
      row.guest_name,
      row.phone,
      row.party_size,
      row.companion_names,
      row.notes,
      row.event_dates?.event_date,
      row.event_dates?.start_time,
      row.event_dates?.end_time,
      row.event_dates?.venue,
      row.status,
      row.created_at,
    ]
      .map(csvSafeCell)
      .join(",")
  );

  const csv = [HEADERS.map(csvSafeCell).join(","), ...rows].join("\r\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="guest-list.csv"');
  return res.status(200).send(csv);
}
