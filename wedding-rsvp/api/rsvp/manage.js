import { getSupabaseAdmin } from "../../server/supabase.js";
import { mapRpcError } from "../../server/rpcErrors.js";
import { checkRateLimit } from "../../server/rateLimit.js";
import {
  isNonEmptyString,
  isValidPhone,
  isValidPartySize,
  isValidReferenceCode,
  sanitizeCompanionNames,
  sanitizeNotes,
} from "../../server/validation.js";

// "Semak / Ubah RSVP": every action here is verified by the reference_code
// + phone pair generated at booking time — never by a pre-issued link.
export default async function handler(req, res) {
  if (!["POST", "PATCH", "DELETE"].includes(req.method)) {
    res.setHeader("Allow", "POST, PATCH, DELETE");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(500).json({ success: false, message: "Supabase environment variables are missing" });
  }

  const withinLimit = await checkRateLimit(req, {
    bucket: "rsvp-manage",
    maxCount: 20,
    windowSeconds: 60,
  });

  if (!withinLimit) {
    return res.status(429).json({ success: false, message: "Terlalu banyak permintaan, sila cuba sebentar lagi" });
  }

  const { reference_code, phone } = req.body || {};

  if (!isValidReferenceCode(reference_code)) {
    return res.status(400).json({ success: false, message: "Kod rujukan tidak sah" });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ success: false, message: "Nombor telefon tidak sah" });
  }

  if (req.method === "POST") {
    const { data, error } = await supabase.rpc("fn_lookup_rsvp", {
      p_reference_code: reference_code,
      p_phone: phone,
    });

    if (error || !data) {
      return res.status(404).json({ success: false, message: "Kod rujukan atau nombor telefon tidak sepadan" });
    }

    return res.status(200).json({ success: true, rsvp: data });
  }

  if (req.method === "PATCH") {
    const { event_date_id, party_size, companion_names, notes } = req.body || {};

    if (!isNonEmptyString(event_date_id, 100)) {
      return res.status(400).json({ success: false, message: "Sila pilih tarikh" });
    }
    if (!isValidPartySize(party_size)) {
      return res.status(400).json({ success: false, message: "Jumlah tetamu mesti 1, 2, atau 3" });
    }

    const { data, error } = await supabase.rpc("fn_update_rsvp", {
      p_reference_code: reference_code,
      p_phone: phone,
      p_event_date_id: event_date_id,
      p_party_size: party_size,
      p_companion_names: sanitizeCompanionNames(companion_names),
      p_notes: sanitizeNotes(notes),
    });

    if (error) {
      const { status, message } = mapRpcError(error);
      return res.status(status).json({ success: false, message });
    }

    return res.status(200).json({ success: true, rsvp: data });
  }

  if (req.method === "DELETE") {
    const { data, error } = await supabase.rpc("fn_cancel_rsvp", {
      p_reference_code: reference_code,
      p_phone: phone,
    });

    if (error) {
      const { status, message } = mapRpcError(error);
      return res.status(status).json({ success: false, message });
    }

    return res.status(200).json({ success: true, rsvp: data });
  }
}
