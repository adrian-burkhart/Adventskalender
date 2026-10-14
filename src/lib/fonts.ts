import { Lora } from "next/font/google"
import localFont from "next/font/local"

/** Headings and door numbers: the calendar's festive italic. */
export const displayFont = localFont({
  src: "../../public/Cochin Bold Italic.otf",
  display: "swap",
  variable: "--font-display",
})

/** Body text: a warm, easy-to-read serif. */
export const bodyFont = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
})
