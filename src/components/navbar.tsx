"use client"

import { memo, useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image, { type StaticImageData } from "next/image"
import clsx from "clsx"
import tree from "../../public/images/tree.webp"
import star from "../../public/images/star.webp"
import door from "../../public/images/door-closed-1.webp"
import { useDesign, type DesignChoice } from "@/lib/design-variants"

export type NavVariant = DesignChoice<"nav">

const LINKS: { text: string; href: string; icon: StaticImageData }[] = [
  { text: "Kalender", href: "/", icon: door },
  { text: "Rangliste", href: "/rangliste", icon: tree },
  { text: "Profil", href: "/profile", icon: star },
]

/** The menu. Three proposals are on trial on staging (see /vorschau). */
const Navbar = memo(({ variant }: { variant?: NavVariant }) => {
  const chosen = useDesign("nav")
  const which = variant ?? chosen
  if (which === "leiste") return <BarNav />
  return <StarNav card={which === "karte"} />
})

// --- The star that opens a menu (proposals 1 and 3) -------------------------

function StarNav({ card }: { card: boolean }) {
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
      {open &&
        (card ? (
          <nav
            id="hauptmenue"
            className="card absolute right-0 top-14 w-56 animate-fade-in p-2"
          >
            <ul className="flex flex-col gap-1">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <MenuLink
                    link={link}
                    current={pathname === link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-lg text-candle hover:bg-gold/10 aria-[current=page]:bg-gold/15"
                  >
                    <Image
                      src={link.icon}
                      alt=""
                      className="h-8 w-8 object-contain"
                    />
                    {link.text}
                  </MenuLink>
                </li>
              ))}
            </ul>
          </nav>
        ) : (
          <nav
            id="hauptmenue"
            className="absolute right-0 top-12 w-40 animate-fade-in"
          >
            <Image
              src={tree}
              alt=""
              className="absolute inset-0 -z-10 w-full"
            />
            <ul className="flex flex-col items-center gap-1.5 px-2 pb-10 pt-12">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <MenuLink
                    link={link}
                    current={pathname === link.href}
                    onClick={() => setOpen(false)}
                    className="block px-2 py-0.5 text-base font-semibold text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.9),0_0_8px_rgb(0_0_0/0.6)] hover:text-candle aria-[current=page]:text-candle aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-4"
                  >
                    {link.text}
                  </MenuLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}
    </div>
  )
}

// --- Always visible links (proposal 2) ---------------------------------------

function BarNav() {
  const pathname = usePathname()
  return (
    <nav className="order-last basis-full sm:order-none sm:basis-auto">
      <ul className="flex items-center justify-center gap-1 sm:justify-end">
        {LINKS.map((link) => (
          <li key={link.href}>
            <MenuLink
              link={link}
              current={pathname === link.href}
              className="block rounded-full px-3 py-1.5 text-base text-candle/85 hover:text-candle aria-[current=page]:text-candle aria-[current=page]:underline aria-[current=page]:decoration-gold aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8"
            >
              {link.text}
            </MenuLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function MenuLink({
  link,
  current,
  onClick,
  className,
  children,
}: {
  link: (typeof LINKS)[number]
  current: boolean
  onClick?: () => void
  className: string
  children: ReactNode
}) {
  return (
    <Link
      href={link.href}
      onClick={onClick}
      aria-current={current ? "page" : undefined}
      className={clsx(
        className,
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/60",
      )}
    >
      {children}
    </Link>
  )
}

export default Navbar
