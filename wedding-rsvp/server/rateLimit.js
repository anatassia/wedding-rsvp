import { getSupabaseAdmin } from "./supabase.js";

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

// Backed by the fn_check_rate_limit DB function (supabase/migrations/0003),
// so the count is shared and exact across every serverless instance —
// unlike an in-memory counter, which would reset per cold start and not be
// shared between concurrent instances.
export async function checkRateLimit(req, { bucket, maxCount, windowSeconds }) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Fail closed only when we also can't reach the DB for the real
    // request anyway; otherwise let the request proceed rather than
    // breaking the whole API on a transient rate-limiter issue.
    return true;
  }

  const key = `${bucket}:${clientIp(req)}`;

  const { data, error } = await supabase.rpc("fn_check_rate_limit", {
    p_key: key,
    p_max_count: maxCount,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    return true;
  }

  return data === true;
}
