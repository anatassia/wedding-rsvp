import { getSupabaseAdmin } from "../../../server/supabase.js";
import { requireOrganiser } from "../../../server/auth.js";
import { mapRpcError } from "../../../server/rpcErrors.js";
import { isValidUuid } from "../../../server/validation.js";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const auth = await requireOrganiser(req);
  if (auth.error === "unauthenticated") {
    return res.status(401).json({ success: false, message: "Sign in required" });
  }
  if (auth.error === "forbidden") {
    return res.status(403).json({ success: false, message: "Not authorised" });
  }

  const { id } = req.query;
  if (!isValidUuid(id)) {
    return res.status(400).json({ success: false, message: "Invalid date id" });
  }

  const { capacity, is_open } = req.body || {};

  if (capacity !== undefined && (!Number.isInteger(capacity) || capacity < 0)) {
    return res.status(400).json({ success: false, message: "Capacity must be a non-negative integer" });
  }
  if (is_open !== undefined && typeof is_open !== "boolean") {
    return res.status(400).json({ success: false, message: "is_open must be true or false" });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(500).json({ success: false, message: "Supabase environment variables are missing" });
  }

  const { data, error } = await supabase.rpc("fn_admin_set_event_date", {
    p_event_date_id: id,
    p_capacity: capacity ?? null,
    p_is_open: is_open ?? null,
  });

  if (error) {
    const { status, message } = mapRpcError(error);
    return res.status(status).json({ success: false, message });
  }

  return res.status(200).json({ success: true, date: data });
}
