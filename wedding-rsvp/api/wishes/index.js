import { getSupabaseAdmin } from "../../server/supabase.js";
import { checkRateLimit } from "../../server/rateLimit.js";
import { isNonEmptyString } from "../../server/validation.js";

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(500).json({ success: false, message: "Supabase environment variables are missing" });
  }

  if (req.method === "GET") {
    const { data, error } = await supabase.rpc("fn_list_wishes", { p_limit: 50 });

    if (error) {
      return res.status(500).json({ success: false, message: "Unable to load wishes" });
    }

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ success: true, wishes: data });
  }

  if (req.method === "POST") {
    const withinLimit = await checkRateLimit(req, {
      bucket: "wish-create",
      maxCount: 10,
      windowSeconds: 60,
    });

    if (!withinLimit) {
      return res.status(429).json({ success: false, message: "Terlalu banyak permintaan, sila cuba sebentar lagi" });
    }

    const { guest_name, message } = req.body || {};

    if (!isNonEmptyString(guest_name, 100)) {
      return res.status(400).json({ success: false, message: "Nama diperlukan" });
    }
    if (!isNonEmptyString(message, 500)) {
      return res.status(400).json({ success: false, message: "Sila tulis ucapan anda" });
    }

    const { data, error } = await supabase.rpc("fn_create_wish", {
      p_guest_name: guest_name.trim(),
      p_message: message.trim(),
    });

    if (error) {
      return res.status(500).json({ success: false, message: "Ralat server tidak dijangka" });
    }

    return res.status(201).json({ success: true, wish: data });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ success: false, message: "Method not allowed" });
}
