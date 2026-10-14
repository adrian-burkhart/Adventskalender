import { memo } from "react"
import Link from "next/link"

const Footer = memo(() => {
  return (
    <footer className="mx-auto mt-16 max-w-5xl border-t border-gold/30">
      <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-2 py-6">
        {[
          { text: "Impressum", href: "/impressum" },
          { text: "Datenschutz", href: "/datenschutz" },
          {
            text: "GitHub",
            href: "https://github.com/adrian-burkhart/Adventskalender",
          },
          // Staging and local runs link the design proposals.
          ...(process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
            ? []
            : [{ text: "Design-Vorschau", href: "/vorschau" }]),
        ].map((link) => (
          <li key={link.href}>
            <Link
              className="text-sm text-candle/80 hover:text-white"
              href={link.href}
            >
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
    </footer>
  )
})

export default Footer
