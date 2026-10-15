"use client"

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { Player, Year, YearScore } from "./hooks"
import { usePathname } from "next/navigation"
import { useSupabaseClient } from "./auth-context"

interface AppContextValue {
  years: Year[]
  /** The year of the season now (or the next one). */
  currentYear: string | null
  selectedYear: Year | null
  setSelectedYear: React.Dispatch<React.SetStateAction<Year | null>>
  player: Player | null
  setPlayer: React.Dispatch<React.SetStateAction<Player | null>>
  scores: YearScore[] | null
  refreshScores: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppDataProvider")
  }
  return context
}

export const useSelectedYear = () => {
  const { years, currentYear, selectedYear, setSelectedYear } = useAppContext()
  return { years, currentYear, selectedYear, setSelectedYear }
}

export const usePlayerContext = () => {
  const { player, setPlayer } = useAppContext()
  return { player, setPlayer }
}

export const useScoresContext = () => {
  const { scores, refreshScores } = useAppContext()
  return { scores, refreshScores }
}

/**
 * Years, the player and their points, rendered on the server with the page.
 * The browser starts with them instead of loading them one after another.
 */
export const AppDataProvider = ({
  initial,
  children,
}: {
  initial: {
    years: Year[]
    currentYear: string
    player: Player | null
    scores: YearScore[]
  } | null
  children: ReactNode
}) => {
  const supabaseClient = useSupabaseClient()
  const years = useMemo(() => initial?.years ?? [], [initial])
  const [chosenYear, setSelectedYear] = useState<Year | null>(null)
  const [player, setPlayer] = useState<Player | null>(initial?.player ?? null)
  const [scores, setScores] = useState<YearScore[] | null>(
    initial?.scores ?? null,
  )

  // The calendar shows the current year unless an admin picks another.
  const currentYear = initial?.currentYear ?? null
  const selectedYear =
    chosenYear ??
    years.find((y) => y.year === currentYear) ??
    (currentYear ? { year: currentYear, questionCount: 0 } : null)

  // A past year is only for a look back: it stays while going between the
  // calendar and its doors, and anywhere else (or after a reload) the
  // calendar shows the current year again.
  const pathname = usePathname()
  const [seenPath, setSeenPath] = useState(pathname)
  if (pathname !== seenPath) {
    setSeenPath(pathname)
    if (pathname !== "/" && !/^\/\d{4}\/\d{1,2}\/?$/.test(pathname)) {
      setSelectedYear(null)
    }
  }

  const refreshScores = useCallback(() => {
    supabaseClient.rpc("my_scores").then(({ data, error }) => {
      if (!error && data) setScores(data as YearScore[])
    })
  }, [supabaseClient])

  return (
    <AppContext.Provider
      value={{
        years,
        currentYear,
        selectedYear,
        setSelectedYear,
        player,
        setPlayer,
        scores,
        refreshScores,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
