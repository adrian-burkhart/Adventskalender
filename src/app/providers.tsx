"use client"

import type { ReactNode } from "react"
import type { AppData } from "@/lib/app-data"
import { AuthProvider } from "@/lib/auth-context"
import { AppDataProvider } from "@/lib/context"
import Snowfall from "@/components/snowfall"
import { FeatureFlagProvider } from "@/lib/feature-flags"

export default function Providers({
  initial,
  children,
}: {
  initial: AppData | null
  children: ReactNode
}) {
  return (
    <AuthProvider initialUser={initial?.user ?? null}>
      <FeatureFlagProvider>
        <AppDataProvider initial={initial}>
          <Snowfall />
          {children}
        </AppDataProvider>
      </FeatureFlagProvider>
    </AuthProvider>
  )
}
