"use client"

import { memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { text: "Kalender", href: "/" },
  { text: "Rangliste", href: "/rangliste" },
  { text: "Profil", href: "/profile" },
]

/**
 * The menu: three links, always visible. On phones it takes its own row
 * under the points; on wider screens it sits next to them.
 */
const Navbar = memo(() => {
  const pathname = usePathname()
  return (
    <nav className="order-last basis-full sm:order-0 sm:basis-auto">
      <ul className="flex items-center justify-center gap-1 sm:justify-end">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="relative block rounded-full px-3 py-1.5 text-base text-candle/85 hover:text-candle focus-visible:ring-4 focus-visible:ring-gold/60 focus-visible:outline-hidden aria-[current=page]:text-candle"
            >
              {link.text}
              {pathname === link.href && <CandyCane />}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
})

export default Navbar

/**
 * Under the page you are on: a little candy cane lying on its side, the
 * hook curling up at the end.
 */
function CandyCane() {
  return (
    <svg
      viewBox="0 0 64 14"
      aria-hidden
      className="absolute -bottom-2 left-1/2 h-4 w-16 -translate-x-1/2 overflow-visible"
    >
      <defs>
        <pattern
          id="cane-stripes"
          width="7"
          height="14"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(35)"
        >
          <rect width="7" height="14" fill="#fff7ef" />
          <rect width="3.2" height="14" fill="#d42a2a" />
        </pattern>
      </defs>
      <path
        d="M3 10 H50 C58 10 61 6 59 3 C57.5 0.8 54 1.3 53.5 4"
        stroke="#8e1d1d"
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
        transform="translate(0 0.8)"
      />
      <path
        d="M3 10 H50 C58 10 61 6 59 3 C57.5 0.8 54 1.3 53.5 4"
        stroke="url(#cane-stripes)"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
