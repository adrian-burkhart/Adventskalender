"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { YearProvider } from "@/lib/context"
import { FeatureFlagProvider } from "@/lib/feature-flags"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <FeatureFlagProvider>
        <YearProvider>{children}</YearProvider>
      </FeatureFlagProvider>
    </AuthProvider>
  )
}
