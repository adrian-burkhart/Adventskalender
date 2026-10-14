import "server-only"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export interface SessionUser {
  id: string
  email: string | null
}

/**
 * The verified user of this request and a Supabase client acting as them.
 * Runs once per request, however many server components ask for it.
 */
export const getSession = cache(async () => {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims
  const user: SessionUser | null = claims?.sub
    ? {
        id: claims.sub,
        email: typeof claims.email === "string" ? claims.email : null,
      }
    : null
  return { supabase, user }
})
