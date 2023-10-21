import { useEffect, useState } from "react"
import { PostgrestError } from "@supabase/supabase-js"
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react"

export interface User {
  id: string
  created_at: string
  score: number
}

export const usePlayers = () => {
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  const [data, setData] = useState<User[] | null>(null)
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

export const useUpdatePlayerScore = () => {
  const supabaseClient = useSupabaseClient()
  const [error, setError] = useState<PostgrestError | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const updatePlayerScore = async (playerId: string, newScore: number) => {
    setLoading(true)

    const { data, error } = await supabaseClient
      .from("players")
      .update({ score: newScore })
      .eq("id", playerId)
      .select()
    setLoading(false)

    if (error) {
      setError(error)
      return
    }

    if (data) {
      console.log("Updated")
    }
  }

  return { updatePlayerScore, error, loading }
}
