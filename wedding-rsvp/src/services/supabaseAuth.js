import { createClient } from "@supabase/supabase-js";

// Frontend-only client, used solely for organiser sign-in via Supabase
// Auth. It never touches application data — all data access goes through
// /api/* using the service-role key on the server. Only the publishable
// (anon) key is used here; it is safe to expose to the browser.
let client = null;

export function getSupabaseAuthClient() {
  if (client) return client;

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return client;
}
