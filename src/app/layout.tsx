import type { Metadata } from "next"
import type { ReactNode } from "react"
import Providers from "./providers"
import { loadAppData } from "@/lib/app-data"
import { fontVariables } from "@/lib/fonts"
import "./globals.css"

export const metadata: Metadata = {
  title: "Adventskalender der Familie Haas",
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  // The player, their points and the years arrive with the HTML.
  const appData = await loadAppData()

  return (
    <html lang="de" className={fontVariables}>
      <body>
        <Providers initial={appData}>{children}</Providers>
      </body>
    </html>
  )
}
