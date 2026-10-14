import {
  Caveat_Brush,
  Fraunces,
  Grenze_Gotisch,
  Lora,
  Mountains_of_Christmas,
} from "next/font/google"
import localFont from "next/font/local"

/** Door numbers, and the headings until another font is chosen. */
export const cochinFont = localFont({
  src: "../../public/Cochin Bold Italic.otf",
  display: "swap",
  variable: "--font-cochin",
})

// Heading fonts on trial on staging (see /vorschau). Only the chosen one
// stays.
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  weight: ["600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
})
const gotisch = Grenze_Gotisch({
  subsets: ["latin"],
  display: "swap",
  weight: ["600"],
  variable: "--font-gotisch",
})
const berge = Mountains_of_Christmas({
  subsets: ["latin"],
  display: "swap",
  weight: ["700"],
  variable: "--font-berge",
})
const pinsel = Caveat_Brush({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  variable: "--font-pinsel",
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
  gotisch,
  berge,
  pinsel,
  bodyFont,
]
  .map((font) => font.variable)
  .join(" ")
