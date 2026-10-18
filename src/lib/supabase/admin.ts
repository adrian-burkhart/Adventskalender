import "server-only"
import { createClient } from "@supabase/supabase-js"
import { supabaseUrl } from "./env"

/**
 * The key that lets the server bypass RLS. Production uses the secret key
 * the Vercel Supabase integration keeps up to date; previews set
 * SUPABASE_SERVICE_ROLE_KEY for the staging project.
 */
export function serverKey() {
  return (
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

/**
 * Service-role client: bypasses RLS. Only for server code: the answer
 * routes, the emails and the "Austausch" comments.
 */
export function createAdminClient() {
  const key = serverKey()
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set")
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
