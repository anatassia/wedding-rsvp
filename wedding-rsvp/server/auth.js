import { getSupabaseAdmin } from "./supabase.js";

function getAdminAllowlist() {
  return (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

// Verifies the bearer token against Supabase Auth itself (not just a
// decoded JWT claim) and checks the resulting user id against a
// server-side allowlist.
//
// Returns { user } on success, or { error: "unauthenticated" | "forbidden" }.
export async function requireOrganiser(req) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return { error: "unauthenticated" };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { error: "unauthenticated" };

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return { error: "unauthenticated" };
  }

  const allowlist = getAdminAllowlist();
  if (!allowlist.includes(data.user.id)) {
    return { error: "forbidden" };
  }

  return { user: data.user };
}
