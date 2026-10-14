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
      id: "fraunces",
      name: "Fraunces",
      hint: "Eure Wahl: weich und warm, mit runden Formen.",
    },
    {
      id: "fraunces-weich",
      name: "Fraunces, kursiv und weich",
      hint: "Dieselbe Schrift, schräg und mit ganz weichen Ecken.",
    },
    {
      id: "young",
      name: "Young Serif",
      hint: "Kräftig und gemütlich, ein bisschen altmodisch.",
    },
    {
      id: "dmserif",
      name: "DM Serif Display",
      hint: "Feiner und eleganter, mit starkem Kontrast.",
    },
    {
      id: "bree",
      name: "Bree Serif",
      hint: "Rund und freundlich, wie von Hand gesetzt.",
    },
  ],
  nav: [
    {
      id: "baum",
      name: "Baum, schlicht",
      hint: "Wie bisher der Stern mit dem Bäumchen, aber kleinere Einträge ohne Rahmen.",
    },
    {
      id: "leiste",
      name: "Leiste",
      hint: "Kein Aufklappen: Kalender, Rangliste und Profil stehen immer sichtbar oben.",
    },
    {
      id: "karte",
      name: "Stern mit Karte",
      hint: "Der Stern öffnet eine kleine Karte mit den Einträgen und gemalten Bildchen.",
    },
  ],
  hausnummer: [
    {
      id: "bisher",
      name: "Wie bisher",
      hint: "Die rote Zahl mitten auf der Tür.",
    },
    {
      id: "emaille",
      name: "Emailleschild",
      hint: "Ein blaues Hausnummernschild über der Tür, wie an deutschen Häusern.",
    },
    {
      id: "holz",
      name: "Holzschild",
      hint: "Ein kleines Holzschild mit gemalter Zahl, an einer Schnur über der Tür.",
    },
    {
      id: "messing",
      name: "Messingzahl",
      hint: "Eine goldene Zahl auf einem dunklen Schild über der Tür.",
    },
  ],
  cards: [
    {
      id: "gold",
      name: "Goldener Schimmer",
      hint: "Wie jetzt: ein weicher, warmer Rand.",
    },
    {
      id: "weiss",
      name: "Weiß wie die Rangliste",
      hint: "Weißer Rand mit leichtem Leuchten und weiße Schrift, wie der Titel der Rangliste.",
    },
  ],
  countdown: [
    {
      id: "bild",
      name: "Gemalter Wichtel",
      hint: "Dein gemalter Wichtel denkt nach, daneben entsteht ein Schneemann.",
    },
    {
      id: "gezeichnet",
      name: "Zwei gezeichnete Wichtel",
      hint: "Zwei in SVG nachgezeichnete Wichtel schieben den Schneemann zusammen.",
    },
  ],
  present: [
    {
      id: "wichtel",
      name: "Wichtel bringt ein Geschenk",
      hint: "Ein Wichtel trägt ein Geschenk herein, es wackelt immer mehr und springt am Ende des Jingles auf.",
    },
    {
      id: "geschenk",
      name: "Geschenk öffnet sich",
      hint: "Das gemalte Geschenk wackelt zum Jingle und öffnet sich am Ende von selbst.",
    },
    {
      id: "schneekugel",
      name: "Schneekugel",
      hint: "Eine Schneekugel wird geschüttelt. Wenn sich der Schnee legt, sieht man den Wichtel jubeln oder mit den Schultern zucken.",
    },
  ],
} as const

export type DesignPart = keyof typeof DESIGN_OPTIONS
export type DesignChoice<P extends DesignPart> =
  (typeof DESIGN_OPTIONS)[P][number]["id"]
type Choices = { [P in DesignPart]: DesignChoice<P> }

const DEFAULTS: Choices = {
  font: "fraunces",
  present: "wichtel",
  countdown: "bild",
  nav: "baum",
  hausnummer: "bisher",
  cards: "gold",
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

  // The heading font and the cards are styled in CSS by these attributes
  // on <html>.
  useEffect(() => {
    document.documentElement.dataset.font = choices.font
    document.documentElement.dataset.cards = choices.cards
  }, [choices.font, choices.cards])

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
