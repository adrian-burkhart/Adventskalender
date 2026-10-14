import { Fraunces, Lora } from "next/font/google"
import localFont from "next/font/local"

/** The door numbers. */
export const cochinFont = localFont({
  src: "../../public/Cochin Bold Italic.otf",
  display: "swap",
  variable: "--font-cochin",
})

/** Headings: a soft, warm serif. */
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "opsz"],
  variable: "--font-fraunces",
})

/**
 * Only the capital J, from Lora: Fraunces' own J sits short on the line and
 * looks odd. Headings list this first, so it takes over just that letter.
 */
const loraJ = localFont({
  src: "../../public/fonts/lora-j-600.woff2",
  weight: "600",
  display: "swap",
  variable: "--font-lora-j",
  // No Arial stand-in: it would cover every letter, not just the J, and
  // hide Fraunces behind it.
  adjustFontFallback: false,
})

/** Body text: a warm, easy-to-read serif. */
export const bodyFont = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora",
})

export const fontVariables = [cochinFont, fraunces, loraJ, bodyFont]
  .map((font) => font.variable)
  .join(" ")
