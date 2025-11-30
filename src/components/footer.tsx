import { memo, useEffect, useRef, useState } from "react"
import Link from "next/link"

const Footer = memo(() => {
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
    <div className="mt-12 border-t-2 border-t-yellow-200">
      <div className="flex flex-col items-center justify-center gap-2 bg-transparent px-2 py-5">
        {[
          { text: "Impressum", href: "/impressum" },
          { text: "Datenschutz", href: "/datenschutz" },
          {
            text: "GitHub",
            href: "https://github.com/adrian-burkhart/Adventskalender",
          },
        ].map((link) => (
          <Link
            className="text-xs text-yellow-200 hover:text-red-700"
            href={link.href}
            key={link.href}
          >
            {link.text}
          </Link>
        ))}
      </div>
    </div>
  )
})

export default Footer
