import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { YearProvider } from "@/lib/context"
import { FeatureFlagProvider } from "@/lib/feature-flags"
import { AuthProvider } from "@/lib/auth-context"

export default function App({
  Component,
  pageProps,
}: AppProps) {
  return (
    <AuthProvider>
      <FeatureFlagProvider>
        <YearProvider>
          <Component {...pageProps} />
        </YearProvider>
      </FeatureFlagProvider>
    </AuthProvider>
  )
}
