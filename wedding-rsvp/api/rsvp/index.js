import { getSupabaseAdmin } from "../../server/supabase.js";
import { mapRpcError } from "../../server/rpcErrors.js";
import { checkRateLimit } from "../../server/rateLimit.js";
import {
  isNonEmptyString,
  isValidPhone,
  isValidPartySize,
  sanitizeCompanionNames,
  sanitizeNotes,
} from "../../server/validation.js";

// Open-access RSVP creation: no invitation token or code is required to
// call this — only remaining capacity on the chosen date gates it.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(500).json({ success: false, message: "Supabase environment variables are missing" });
  }

  const withinLimit = await checkRateLimit(req, {
    bucket: "rsvp-create",
    maxCount: 20,
    windowSeconds: 60,
  });

  if (!withinLimit) {
    return res.status(429).json({ success: false, message: "Terlalu banyak permintaan, sila cuba sebentar lagi" });
  }

  const { event_date_id, guest_name, phone, party_size, companion_names, notes } = req.body || {};

  if (!isNonEmptyString(event_date_id, 100)) {
    return res.status(400).json({ success: false, message: "Sila pilih tarikh" });
  }
  if (!isNonEmptyString(guest_name, 150)) {
    return res.status(400).json({ success: false, message: "Nama penuh diperlukan" });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ success: false, message: "Nombor telefon tidak sah" });
  }
  if (!isValidPartySize(party_size)) {
    return res.status(400).json({ success: false, message: "Jumlah tetamu mesti 1, 2, atau 3" });
  }

  const { data, error } = await supabase.rpc("fn_create_rsvp", {
    p_event_date_id: event_date_id,
    p_guest_name: guest_name.trim(),
    p_phone: phone.trim(),
    p_party_size: party_size,
    p_companion_names: sanitizeCompanionNames(companion_names),
    p_notes: sanitizeNotes(notes),
  });

  if (error) {
    const { status, message } = mapRpcError(error);
    return res.status(status).json({ success: false, message });
  }

  return res.status(201).json({ success: true, rsvp: data });
}
