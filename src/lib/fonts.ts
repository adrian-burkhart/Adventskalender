import {
  Bree_Serif,
  DM_Serif_Display,
  Fraunces,
  Lora,
  Young_Serif,
} from "next/font/google"
import localFont from "next/font/local"

/** The door numbers. */
export const cochinFont = localFont({
  src: "../../public/Cochin Bold Italic.otf",
  display: "swap",
  variable: "--font-cochin",
})

// Heading fonts on trial on staging (see /vorschau): Fraunces and fonts
// like it. Only the chosen one stays.
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
})
const young = Young_Serif({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  variable: "--font-young",
})
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-dmserif",
})
const bree = Bree_Serif({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  variable: "--font-bree",
})

/** Body text: a warm, easy-to-read serif. */
export const bodyFont = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
})

export const fontVariables = [
  cochinFont,
  fraunces,
  young,
  dmSerif,
  bree,
  bodyFont,
]
  .map((font) => font.variable)
  .join(" ")
