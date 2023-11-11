import "@/styles/globals.css"
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs"
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react"
import { useState } from "react"
import type { AppProps } from "next/app"
import { YearProvider } from "@/lib/context"
import { FeatureFlagProvider } from "@/lib/feature-flags"

export default function App({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session
}>) {
  const [supabaseClient] = useState(() => createPagesBrowserClient())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <FeatureFlagProvider>
        <YearProvider>
          <Component {...pageProps} />
        </YearProvider>
      </FeatureFlagProvider>
    </SessionContextProvider>
  )
}
