"use client"

import { useEffect, useState } from "react"
import { PostgrestError } from "@supabase/supabase-js"
import { useUser, useSupabaseClient } from "@/lib/auth-context"
import type { DoorState } from "./doors"
import { apiFetch } from "./api-client"

/* eslint-disable react-hooks/exhaustive-deps */
export function useEffectOnce(fn: () => void) {
  useEffect(() => {
    fn()
  }, [])
}
/* eslint-enable react-hooks/exhaustive-deps */

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

/** Every player's points for one year, best first (computed in the DB). */
export const useLeaderboard = (year: string | null) => {
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  const [data, setData] = useState<LeaderboardEntry[] | null>(null)
  const [error, setError] = useState<PostgrestError | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!user || !year) return
    let cancelled = false

    supabaseClient
      .rpc("leaderboard", { p_year: Number(year) })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) setError(error)
        else setData(data as LeaderboardEntry[])
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user, year, supabaseClient])

  return { entries: data, loading, error }
}

/** Years that have points, for the leaderboard's year switch. */
export const useScoreYears = () => {
  const supabaseClient = useSupabaseClient()
  const user = useUser()
  const [years, setYears] = useState<number[]>([])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    supabaseClient.rpc("score_years").then(({ data }) => {
      if (!cancelled && data) setYears(data as number[])
    })

    return () => {
      cancelled = true
    }
  }, [user, supabaseClient])

  return years
}

/** The logged-in player's points per year. */
export const useMyScores = () => {
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  const [data, setData] = useState<YearScore[] | null>(null)
  const [error, setError] = useState<PostgrestError | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    supabaseClient.rpc("my_scores").then(({ data, error }) => {
      if (cancelled) return
      if (error) setError(error)
      else setData(data as YearScore[])
    })

    return () => {
      cancelled = true
    }
  }, [user, supabaseClient])

  return { scores: data, error }
}

export const usePlayer = () => {
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  const [data, setData] = useState<Player | null>(null)
  const [error, setError] = useState<PostgrestError | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const { data, error } = await supabaseClient
        .from("players")
        .select("id, created_at, name")
        .eq("id", user?.id)
        .single()
      setLoading(false)

      if (error) {
        setError(error)
        return
      }

      setData(data)
    }

    if (user) loadData()
  }, [user, supabaseClient])

  return { player: data, loading, error }
}

export const useUpdatePlayerName = () => {
  const supabaseClient = useSupabaseClient()
  const [error, setError] = useState<PostgrestError | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const updatePlayerName = async (player: Player, newName: string) => {
    setLoading(true)
    setUpdateSuccess(false)
    setError(null)

    const { error } = await supabaseClient
      .from("players")
      .update({ name: newName.trim() })
      .eq("id", player.id)

    setLoading(false)

    if (error) {
      setError(error)
    } else {
      setUpdateSuccess(true)
    }
  }

  return { updatePlayerName, error, loading, updateSuccess }
}

export interface Year {
  year: string
  questionCount: number
}

export const useYears = () => {
  const [years, setYears] = useState<Year[] | null>([])
  const [currentYear, setCurrentYear] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    apiFetch<{ years: Year[]; currentYear: string }>("/api/years")
      .then(({ years, currentYear }) => {
        if (cancelled) return
        setYears(years)
        setCurrentYear(currentYear)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { years, currentYear, loading, error }
}

export type { DoorState }

export const useDoors = (year: Year | null) => {
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [doorStates, setDoorStates] = useState<DoorState[]>(
    Array(24).fill("locked"),
  )

  useEffect(() => {
    if (!year) return
    let cancelled = false

    apiFetch<{ doors: DoorState[] }>(`/api/doors/${year.year}`)
      .then(({ doors }) => {
        if (!cancelled) setDoorStates(doors)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [year])

  const openDoor = async (doorNumber: number) => {
    if (!year) return
    await apiFetch(`/api/doors/${year.year}/${doorNumber}/open`, {
      method: "POST",
    }).catch((e: Error) => console.error(e))
  }

  return { doorStates, openDoor, error, loading }
}
