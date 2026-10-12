"use client"

import { useEffect, useState } from "react"
import { PostgrestError } from "@supabase/supabase-js"
import { useUser, useSupabaseClient } from "@/lib/auth-context"
import type { DoorState } from "./doors"
import { apiFetch } from "./api-client"

interface Score {
  year: string
  score: number
}

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
  scores: Score[]
  doors_opened: { year: string; door_number: number; isAnswered?: boolean }[]
}

export const usePlayers = () => {
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  const [data, setData] = useState<Player[] | null>(null)
  const [error, setError] = useState<PostgrestError | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const { data, error } = await supabaseClient.from("players").select("*")
      setLoading(false)

      if (error) {
        setError(error)
        return
      }

      setData(data)
    }

    if (user) loadData()
  }, [user, supabaseClient])

  return { players: data, loading, error }
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
        .select("*")
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

    const { error } = await supabaseClient
      .from("players")
      .update({ name: newName })
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    apiFetch<{ years: Year[] }>("/api/years")
      .then(({ years }) => {
        if (!cancelled) setYears(years)
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

  return { years, loading, error }
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
