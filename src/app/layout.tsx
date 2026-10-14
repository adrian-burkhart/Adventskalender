import type { Metadata } from "next"
import type { ReactNode } from "react"
import Providers from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Adventskalender der Familie Haas",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
