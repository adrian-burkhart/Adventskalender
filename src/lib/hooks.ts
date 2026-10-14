"use client"

import { useEffect, useState } from "react"
import { PostgrestError } from "@supabase/supabase-js"
import { useUser, useSupabaseClient } from "@/lib/auth-context"
import type { DoorState } from "./doors"
import { apiFetch } from "./api-client"
import { usePlayerContext, useScoresContext } from "./context"
import { FeatureFlag, useFeatureFlag } from "./feature-flags"

export interface Player {
  id: string
  created_at: string
  name: string
}

export interface LeaderboardEntry {
  /** null for imported players from old seasons without an account. */
  player_id: string | null
  name: string
  score: number
  doors: number
}

export interface YearScore {
  year: number
  score: number
  doors: number
}

/**
 * Every player's points for one year, best first (computed in the DB). The
 * year the server rendered comes along as `initial`; other years load here.
 */
export const useLeaderboard = (
  year: string | null,
  initial?: { year: string; entries: LeaderboardEntry[] },
) => {
  const supabaseClient = useSupabaseClient()
  const userId = useUser()?.id
  const seeded = !!initial && initial.year === year

  const [state, setState] = useState<{
    year: string
    entries?: LeaderboardEntry[]
    error?: PostgrestError
  } | null>(null)

  useEffect(() => {
    if (!userId || !year || seeded) return
    let cancelled = false

    supabaseClient
      .rpc("leaderboard", { p_year: Number(year) })
      .then(({ data, error }) => {
        if (cancelled) return
        setState(
          error
            ? { year, error }
            : { year, entries: data as LeaderboardEntry[] },
        )
      })

    return () => {
      cancelled = true
    }
  }, [userId, year, seeded, supabaseClient])

  if (seeded) return { entries: initial.entries, loading: false, error: null }
  const current = state?.year === year ? state : null
  return {
    entries: current?.entries ?? null,
    loading: !current,
    error: current?.error ?? null,
  }
}

/** The logged-in player's points per year. */
export const useMyScores = () => {
  const { scores } = useScoresContext()
  return { scores }
}

/** The logged-in player (id, name). */
export const usePlayer = () => {
  const { player } = usePlayerContext()
  return { player }
}

export const useUpdatePlayerName = () => {
  const supabaseClient = useSupabaseClient()
  const { setPlayer } = usePlayerContext()
  const [error, setError] = useState<PostgrestError | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const updatePlayerName = async (player: Player, newName: string) => {
    setLoading(true)
    setUpdateSuccess(false)
    setError(null)

    const name = newName.trim()
    const { error } = await supabaseClient
      .from("players")
      .update({ name })
      .eq("id", player.id)

    setLoading(false)

    if (error) {
      setError(error)
    } else {
      setUpdateSuccess(true)
      setPlayer((current) => (current ? { ...current, name } : current))
    }
  }

  return { updatePlayerName, error, loading, updateSuccess }
}

export interface Year {
  year: string
  questionCount: number
}

export type { DoorState }

/** The current year's doors, rendered on the server with the page. */
export interface InitialDoors {
  year: string
  /** Today's door (1 to 24), or null outside 1 to 24 December. */
  today: number | null
  doors: DoorState[]
}

/**
 * The doors of one year. The server renders the current year's doors with
 * the page (`initial`); another year, or test mode, loads them here.
 */
export const useDoors = (year: Year | null, initial?: InitialDoors) => {
  const testMode = useFeatureFlag(FeatureFlag.ENABLE_TEST_MODE)
  const key = year ? `${year.year}:${testMode}` : null
  const seeded = !!initial && !testMode && initial.year === year?.year

  const [state, setState] = useState<{
    key: string
    doors?: DoorState[]
    today?: number | null
    error?: Error
  } | null>(null)

  useEffect(() => {
    if (!key || seeded) return
    let cancelled = false

    apiFetch<{ doors: DoorState[]; today: number | null }>(
      `/api/doors/${key.split(":")[0]}`,
    )
      .then(({ doors, today }) => {
        if (!cancelled) setState({ key, doors, today })
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ key, error })
      })

    return () => {
      cancelled = true
    }
  }, [key, seeded])

  const current = state?.key === key ? state : null
  const doorStates = seeded ? initial.doors : (current?.doors ?? null)
  const today = seeded ? initial.today : (current?.today ?? null)
  const loading = !seeded && !current
  const error = seeded ? null : (current?.error ?? null)

  const openDoor = async (doorNumber: number) => {
    if (!year) return
    await apiFetch(`/api/doors/${year.year}/${doorNumber}/open`, {
      method: "POST",
    }).catch((e: Error) => console.error(e))
  }

  return { doorStates, today, openDoor, error, loading }
}
