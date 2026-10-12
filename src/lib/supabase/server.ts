import "server-only"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { supabaseAnonKey, supabaseUrl } from "./env"

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Acts as the logged-in user (RLS applies).
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Called from a Server Component, which can't set cookies.
          // proxy.ts refreshes the session, so this is safe to ignore.
        }
      },
    },
  })
}

/**
 * The verified user for server code, or null. Never trust getSession() on
 * the server: it reads the cookie without verifying it.
 */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
