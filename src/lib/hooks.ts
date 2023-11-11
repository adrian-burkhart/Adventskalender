import { useEffect, useState } from "react"
import { PostgrestError } from "@supabase/supabase-js"
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react"
import Error from "next/error"
import { createClient } from "next-sanity"
import { DateTime } from "luxon"
import { FeatureFlag, useFeatureFlag } from "./feature-flags"

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
  doors_opened: { year: string; door_number: number }[]
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

export type DoorState = "closed" | "open" | "locked"
export interface Door {
  year: string
  door_number: number
}

export const useDoors = (player: Player | null, year: Year | null) => {
  const supabaseClient = useSupabaseClient()
  const [error, setError] = useState<PostgrestError | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [doorStates, setDoorStates] = useState<DoorState[]>(
    Array(24).fill("locked"),
  )
  const enabledTestMode = useFeatureFlag(FeatureFlag.ENABLE_TEST_MODE)

  useEffect(() => {
    const fetchDoorStates = async () => {
      if (player === null || year === null) {
        console.error("Missing player id or year", player, year)
        return
      }

      setLoading(true)

      const { data, error } = await supabaseClient
        .from("players")
        .select("doors_opened")
        .eq("id", player.id)

      setLoading(false)

      if (error) {
        setError(error)
        return
      }

      const today = DateTime.local().startOf("day")
      const doorsOpened = data?.[0]?.doors_opened || []

      const newDoorStates = doorStates.map((_, index) => {
        const doorNumber = index + 1
        const doorDate = DateTime.fromObject({
          year: parseInt(year.year),
          month: 12,
          day: doorNumber,
        })

        if (doorDate > today && !enabledTestMode) {
          return "locked"
        }

        const doorOpened = doorsOpened.some(
          (door: Door) =>
            door.year === year.year && door.door_number === doorNumber,
        )

        return doorOpened ? "open" : "closed"
      })

      setDoorStates(newDoorStates)
    }

    fetchDoorStates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, year])

  const openDoor = async (doorNumber: number) => {
    if (player === null || year === null) {
      console.error("Missing player id or year")
      return
    }

    const existingDoors = player?.doors_opened || []
    const isAlreadyOpened = existingDoors.some(
      (door) => door.year === year.year && door.door_number === doorNumber,
    )

    if (isAlreadyOpened) {
      console.log("Door is already opened")
      return
    }

    const updatedDoors = [
      ...existingDoors,
      { year: year.year, door_number: doorNumber },
    ]

    setLoading(true)

    const { error } = await supabaseClient
      .from("players")
      .update({
        doors_opened: updatedDoors,
      })
      .eq("id", player.id)

    setLoading(false)

    if (error) {
      setError(error)
      return
    }

    const updatedDoorStates = [...doorStates]
    updatedDoorStates[doorNumber - 1] = "open"
    setDoorStates(updatedDoorStates)
  }

  return { doorStates, openDoor, error, loading }
}
