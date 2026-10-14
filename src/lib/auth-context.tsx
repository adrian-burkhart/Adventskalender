"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface AuthUser {
  id: string
  email: string | null
}

interface AuthContextType {
  user: AuthUser | null
  supabaseClient: ReturnType<typeof createClient>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * The logged-in user comes from the server with the page, so nothing waits
 * for the browser to ask Supabase first. Afterwards the browser only follows
 * logins and logouts.
 */
export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser: AuthUser | null
  children: React.ReactNode
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser)
  const [supabaseClient] = useState(() => createClient())

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        const next = session?.user
        // Same user (e.g. a refreshed token): keep the object, so nothing
        // that depends on it loads again.
        setUser((current) =>
          current?.id === next?.id
            ? current
            : next
              ? { id: next.id, email: next.email ?? null }
              : null,
        )
      },
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabaseClient])

  return (
    <AuthContext.Provider value={{ user, supabaseClient }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useUser() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider")
  }
  return context.user
}

export function useSupabaseClient() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useSupabaseClient must be used within an AuthProvider")
  }
  return context.supabaseClient
}
