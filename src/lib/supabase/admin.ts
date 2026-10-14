import "server-only"
import { createClient } from "@supabase/supabase-js"
import { supabaseUrl } from "./env"

/**
 * Service-role client: bypasses RLS. Only for the answer routes, which
 * write through the database functions that nobody else may call.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set")
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
