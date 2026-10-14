"use client"

import { memo, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import tree from "../../public/images/tree.webp"
import star from "../../public/images/star.webp"
import Image from "next/image"
import clsx from "clsx"

const LINKS = [
  { text: "Kalender", href: "/" },
  { text: "Rangliste", href: "/rangliste" },
  { text: "Profil", href: "/profile" },
]

/** The star at the top right opens a little tree with the menu on it. */
const Navbar = memo(() => {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open])

  return (
    <div ref={menuRef} className="relative z-20 flex flex-col items-center">
      <button
        type="button"
        aria-label="Menü"
        aria-expanded={open}
        aria-controls="hauptmenue"
        onClick={() => setOpen(!open)}
        className={clsx(
          "rounded-full p-2 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/60",
          open ? "animate-glow" : "hover:animate-spin",
        )}
      >
        <Image src={star} width={44} height={44} alt="" />
      </button>
      {open && (
        <nav
          id="hauptmenue"
          className="absolute right-0 top-12 w-44 animate-fade-in"
        >
          <Image src={tree} alt="" className="absolute inset-0 -z-10 w-full" />
          <ul className="flex flex-col items-center gap-1 px-2 pb-10 pt-12">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className="block rounded-full bg-pine-950/75 px-4 py-1.5 text-base text-candle shadow hover:bg-berry focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 aria-[current=page]:bg-berry"
                >
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
})

export default Navbar
