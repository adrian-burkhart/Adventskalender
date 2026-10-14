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

// Design proposals that are being tried out on staging. Each part of the
// door has a few variants; /vorschau shows them all and lets you pick which
// one the real door uses on this device. Once one is chosen for good, the
// others and this switch can go.

export const DESIGN_OPTIONS = {
  countdown: [
    { id: "kerze", name: "Kerze", hint: "Eine Kerze brennt herunter." },
    {
      id: "kranz",
      name: "Adventskranz",
      hint: "Ein goldener Ring um einen Tannenkranz schließt sich.",
    },
    {
      id: "lichterkette",
      name: "Lichterkette",
      hint: "Jede Sekunde geht ein Lämpchen aus.",
    },
  ],
  present: [
    {
      id: "schleife",
      name: "Schleife aufziehen",
      hint: "Ein Tipp löst die Schleife, der Deckel fliegt auf und Licht strömt heraus.",
    },
    {
      id: "schuetteln",
      name: "Dreimal schütteln",
      hint: "Jeder Tipp schüttelt stärker, bis das Geschenk beim dritten Mal aufspringt.",
    },
    {
      id: "auspacken",
      name: "Auspacken",
      hint: "Ein Tipp reißt das Papier auf, darunter steigt ein leuchtender Stern auf.",
    },
  ],
  result: [
    {
      id: "karte",
      name: "Weihnachtskarte",
      hint: "Das Ergebnis steht auf einer Karte mit Wachssiegel.",
    },
    {
      id: "baum",
      name: "Dein Weihnachtsbaum",
      hint: "Jede Antwort hängt etwas an deinen Baum: richtig eine Kugel, falsch einen Strohstern.",
    },
    {
      id: "lebkuchen",
      name: "Lebkuchenherz",
      hint: "Wie auf dem Weihnachtsmarkt: ein Lebkuchenherz mit Zuckerguss.",
    },
  ],
  rangliste: [
    {
      id: "klassisch",
      name: "Klassisch, verbessert",
      hint: "Die bekannte Liste mit gemeinsamen Plätzen, Medaillen und dir hervorgehoben.",
    },
    {
      id: "familie",
      name: "Familienrangliste",
      hint: "Siegertreppchen, was die Familie gemeinsam geschafft hat und wer noch fehlt.",
    },
  ],
} as const

export type DesignPart = keyof typeof DESIGN_OPTIONS
export type DesignChoice<P extends DesignPart> =
  (typeof DESIGN_OPTIONS)[P][number]["id"]
type Choices = { [P in DesignPart]: DesignChoice<P> }

const DEFAULTS: Choices = {
  countdown: "kerze",
  present: "schleife",
  result: "karte",
  rangliste: "familie",
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
