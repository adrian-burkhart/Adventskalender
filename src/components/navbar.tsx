import { memo, useEffect, useRef, useState } from "react"
import Link from "next/link"
import clsx from "clsx"
import { TreeEvergreen } from "phosphor-react"

const Navbar = memo(() => {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative">
      <div
        ref={menuRef}
        className="absolute inset-0 left-auto flex w-20 flex-col items-center justify-center pt-8"
      >
        <div
          className="flex h-8 w-16 items-center justify-center"
          onClick={() => setOpen(!open)}
        >
          <TreeEvergreen
            size={32}
            className={clsx({
              "text-yellow-200": !open,
              "animate-spin-thrice text-yellow-700": open,
            })}
          />
        </div>
        {open && (
          <div className="h-full">
            <div className="flex flex-col items-center gap-2 bg-green-950 px-2 py-4">
              {[
                { text: "Kalender", href: "/" },
                { text: "Rangliste", href: "/rangliste" },
                { text: "Profil", href: "/profile" },
              ].map((link) => (
                <Link
                  className="text-yellow-200 hover:text-red-700"
                  href={link.href}
                  key={link.href}
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export default Navbar
