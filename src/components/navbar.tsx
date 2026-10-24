"use client"

import { memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { text: "Kalender", href: "/" },
  { text: "Rangliste", href: "/rangliste" },
  { text: "Austausch", href: "/austausch" },
  { text: "Meine Seite", href: "/profile" },
]

/**
 * The menu: four links, always visible. On phones it takes its own row
 * under the points; on wider screens it sits next to them.
 */
const Navbar = memo(() => {
  const pathname = usePathname()
  return (
    <nav className="order-last basis-full sm:order-0 sm:basis-auto">
      <ul className="flex items-center justify-center sm:justify-end sm:gap-1">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="block rounded-full px-1.5 py-1.5 text-base text-candle/85 hover:text-candle focus-visible:ring-4 focus-visible:ring-gold/60 focus-visible:outline-hidden aria-[current=page]:text-candle aria-[current=page]:underline aria-[current=page]:decoration-gold aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8 sm:px-3"
            >
              {link.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
})

export default Navbar
