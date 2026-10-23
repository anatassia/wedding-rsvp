import { getSupabaseAdmin } from "../../server/supabase.js";
import { requireOrganiser } from "../../server/auth.js";
import { isValidUuid } from "../../server/validation.js";

export async function fetchGuestRows(supabase, { search, eventDateId, status }) {
  let query = supabase
    .from("rsvps")
    .select(
      "id, reference_code, guest_name, phone, party_size, companion_names, notes, status, created_at, updated_at, cancelled_at, event_date_id, event_dates(event_date, start_time, end_time, venue)"
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }
  if (eventDateId) {
    query = query.eq("event_date_id", eventDateId);
  }
  if (search) {
    // PostgREST's .or() filter string treats , ( ) as syntax, so strip
    // them from user input rather than letting it alter the filter shape.
    const term = search.trim().replace(/[,()%]/g, "");
    if (term.length > 0) {
      query = query.or(`guest_name.ilike.%${term}%,phone.ilike.%${term}%,reference_code.ilike.%${term}%`);
    }
  }

  return query;
}

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

  return res.status(200).json({ success: true, guests: data });
}
