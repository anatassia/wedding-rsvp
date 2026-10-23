import { getSupabaseAdmin } from "../server/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return res.status(500).json({
      success: false,
      message: "Supabase environment variables are missing",
    });
  }

  try {
    const { data, error } = await supabase.rpc("fn_public_event_dates");

    if (error) {
      console.error("Read wedding dates failed:", error.code);

      return res.status(500).json({
        success: false,
        message: "Unable to load wedding dates",
      });
    }

    res.setHeader("Cache-Control", "no-store");

    return res.status(200).json({
      success: true,
      dates: data,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to connect to Supabase",
    });
  }
}
