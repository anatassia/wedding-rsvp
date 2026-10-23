import { createClient } from "@supabase/supabase-js";

let client = null;

// One lazily-created service-role client, reused across invocations of the
// same serverless function instance. Never import this from frontend code —
// it holds full database access and must only run on the server.
export function getSupabaseAdmin() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    return null;
  }

  client = createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return client;
}
