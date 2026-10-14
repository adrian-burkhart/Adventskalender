"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { getValueFromStorage, setValueInStorage } from "./storage"

// Design proposals that are being tried out on staging. Each part has a few
// variants; /vorschau shows them all and lets you pick which one the real
// app uses on this device. Once one is chosen for good, the
// others and this switch can go.

export const DESIGN_OPTIONS = {
  font: [
    {
      id: "cochin",
      name: "Cochin (bisher)",
      hint: "Die bisherige festliche Kursive.",
    },
    {
      id: "fraunces",
      name: "Fraunces",
      hint: "Eine weiche, warme Buchschrift mit runden Formen.",
    },
    {
      id: "gotisch",
      name: "Grenze Gotisch",
      hint: "Eine leichte Fraktur wie auf Schildern vom Weihnachtsmarkt.",
    },
    {
      id: "berge",
      name: "Mountains of Christmas",
      hint: "Verspielt und ein bisschen von Hand gezeichnet.",
    },
    {
      id: "pinsel",
      name: "Caveat Brush",
      hint: "Wie mit dem Pinsel geschrieben, passend zu den Bildern.",
    },
  ],
  buttons: [
    {
      id: "schlicht",
      name: "Schlicht (bisher)",
      hint: "Rot mit goldenem Rand.",
    },
    {
      id: "kugel",
      name: "Christbaumkugel",
      hint: "Goldgelb mit grünem Rand wie der gemalte Play-Knopf.",
    },
    {
      id: "girlande",
      name: "Tannengirlande",
      hint: "Rot mit weichem Tannenrand und Lichtern wie der „Bereit“-Knopf.",
    },
  ],
  snow: [
    {
      id: "punkte",
      name: "Pünktchen (bisher)",
      hint: "Kleine weiße Punkte, die langsam fallen.",
    },
    {
      id: "kristalle",
      name: "Schneekristalle",
      hint: "Echte sechsarmige Flocken, die sich beim Fallen sanft drehen.",
    },
    {
      id: "gemalt",
      name: "Gemalte Flocken",
      hint: "Weiche, verschwommene Flocken in drei Tiefen, wie im Bild auf der Startseite.",
    },
    {
      id: "gemischt",
      name: "Gemischt",
      hint: "Weiche Flocken im Hintergrund, ein paar Kristalle ganz vorne.",
    },
  ],
  present: [
    {
      id: "deckel",
      name: "Deckel heben",
      hint: "Ein Tipp, der Deckel hebt sich, warmes Licht und ein paar Flocken steigen auf.",
    },
    {
      id: "schuetteln",
      name: "Dreimal schütteln",
      hint: "Jeder Tipp wackelt etwas mehr, beim dritten springt der Deckel auf.",
    },
    {
      id: "saeckchen",
      name: "Wichtelsäckchen",
      hint: "Ein Jutesäckchen mit Schleife. Ein Tipp löst die Schleife, der Stern kommt heraus.",
    },
  ],
} as const

export type DesignPart = keyof typeof DESIGN_OPTIONS
export type DesignChoice<P extends DesignPart> =
  (typeof DESIGN_OPTIONS)[P][number]["id"]
type Choices = { [P in DesignPart]: DesignChoice<P> }

const DEFAULTS: Choices = {
  font: "cochin",
  buttons: "schlicht",
  snow: "punkte",
  present: "deckel",
}

const STORAGE_KEY = "DESIGN_VARIANTS"

const DesignContext = createContext<{
  choices: Choices
  choose: <P extends DesignPart>(part: P, id: DesignChoice<P>) => void
}>({ choices: DEFAULTS, choose: () => {} })

export function DesignProvider({ children }: { children: ReactNode }) {
  const [choices, setChoices] = useState<Choices>(DEFAULTS)

  // Read the choice after mounting, so the server's HTML still matches.
  useEffect(() => {
    const stored = getValueFromStorage<Partial<Choices>>({
      storage: window.localStorage,
      key: STORAGE_KEY,
      defaultValue: {},
    })
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setChoices((current) => ({ ...current, ...valid(stored) }))
  }, [])

  const choose = useCallback(
    <P extends DesignPart>(part: P, id: DesignChoice<P>) => {
      setChoices((current) => ({ ...current, [part]: id }))
      setValueInStorage<Partial<Choices>>({
        storage: window.localStorage,
        key: STORAGE_KEY,
        defaultValue: {},
        updateFn: (old) => ({ ...old, [part]: id }),
      })
    },
    [],
  )

  // Fonts and buttons are styled in CSS by these attributes on <html>.
  useEffect(() => {
    document.documentElement.dataset.font = choices.font
    document.documentElement.dataset.buttons = choices.buttons
  }, [choices.font, choices.buttons])

  const value = useMemo(() => ({ choices, choose }), [choices, choose])
  return (
    <DesignContext.Provider value={value}>{children}</DesignContext.Provider>
  )
}

/** Drops stored ids that no longer exist. */
function valid(stored: Partial<Choices>): Partial<Choices> {
  const result: Partial<Record<DesignPart, string>> = {}
  for (const part of Object.keys(DESIGN_OPTIONS) as DesignPart[]) {
    const id = stored[part]
    if (DESIGN_OPTIONS[part].some((option) => option.id === id)) {
      result[part] = id
    }
  }
  return result as Partial<Choices>
}

export function useDesign<P extends DesignPart>(part: P): DesignChoice<P> {
  return useContext(DesignContext).choices[part] as DesignChoice<P>
}

export function useChooseDesign() {
  return useContext(DesignContext).choose
}
