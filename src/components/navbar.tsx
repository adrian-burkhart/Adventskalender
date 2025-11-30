import { memo, useEffect, useRef, useState } from "react"
import Link from "next/link"
import tree from "../../public/images/tree.webp"
import star from "../../public/images/star.webp"
import Image from "next/image"
import clsx from "clsx"

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
        className="absolute inset-0 left-auto flex h-max w-max flex-col items-center justify-center pt-8"
      >
        <div
          className={clsx("mx-10 flex cursor-pointer items-center justify-center", { "hover:animate-spin": !open })}
          onClick={() => setOpen(!open)}
        >
          <Image src={star} width={32} height={32} alt="menu" />
          {open && (
            <Image
              className="absolute inset-0 -left-[2px] top-[50px] -z-10"
              src={tree}
              alt="menu"
            />
          )}
        </div>
        {open && (
          <div className="h-full">
            <div className="flex flex-col items-center gap-2 bg-transparent px-2 py-5">
              {[
                { text: "Profil", href: "/profile" },
                { text: "Kalender", href: "/" },
                { text: "Rangliste", href: "/rangliste" },
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
        )}
      </div>
    </div>
  )
})

export default Navbar
