import { createContext, useContext, useEffect, useState } from "react"
import { PostgrestError } from "@supabase/supabase-js"
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react"
import Error from "next/error"
import { createClient } from "next-sanity"
import { dateNowUtc, dateTimeFromIso } from "./dateTime"
import { last } from "lodash"

interface Score {
  year: string
  score: number
}
export interface User {
  id: string
  created_at: string
  name: string
  scores: Score[]
  doors_opened: { year: string; opened: number[] }[]
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

export const usePlayer = () => {
  const supabaseClient = useSupabaseClient()
  const user = useUser()

  const [data, setData] = useState<User | null>(null)
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

export interface AudioFile {
  name: string
  file: string
}

export interface Question {
  answer: string
  door_number: number
  question: string
  reward: number
  answer_options: string[]
  audiofile_intro: AudioFile
  audiofile_question: AudioFile
  audiofile_outro: AudioFile
  image: string
}

export interface Year {
  year: string
  questions: Question[]
}

const client = createClient({
  projectId: "jrlkjoz0",
  dataset: "production",
  apiVersion: "2023-10-21",
  useCdn: false,
})

export const useYears = () => {
  const [years, setYears] = useState<Year[] | null>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const years = await client.fetch(`
        *[_type == "year"]{
          year,
          "questions": questions[] -> {
            answer,
            question,
            reward,
            door_number,
            answer_options,
            "audiofile_intro": audiofile_intro-> {
              name,
              "file": audiofile.asset->url
            },
            "audiofile_question": audiofile_question-> {
              name,
              "file": audiofile.asset->url
            },
            "audiofile_outro": audiofile_outro-> {
              name,
              "file": audiofile.asset->url
            },
            "image": image.asset->url
          }
        }
      `)

      setYears(years)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return { years, loading, error }
}
