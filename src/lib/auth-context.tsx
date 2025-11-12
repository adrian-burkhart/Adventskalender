import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

interface AuthContextType {
  user: User | null
  supabaseClient: ReturnType<typeof createClient>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseClient] = useState(() => createClient())

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser()
      setUser(user)
    }
    getUser()

    // Listen for auth changes
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
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
    throw new Error('useUser must be used within an AuthProvider')
  }
  return context.user
}

export function useSupabaseClient() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseClient must be used within an AuthProvider')
  }
  return context.supabaseClient
}