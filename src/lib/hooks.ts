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

export const useUpdatePlayerScore = () => {
  const supabaseClient = useSupabaseClient()
  const [error, setError] = useState<PostgrestError | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const updatePlayerScore = async (
    player: Player,
    year: string,
    newScore: number,
  ) => {
    setLoading(true)
    const numericYear = Number(year)

    const existingEntryIndex = player.scores.findIndex(
      (score) => Number(score.year) === numericYear,
    )

    let updatedScores
    if (existingEntryIndex >= 0) {
      // Entry exists, update its score
      updatedScores = [...player.scores]
      updatedScores[existingEntryIndex].score += newScore
    } else {
      // Entry does not exist, add a new one
      updatedScores = [...player.scores, { year: numericYear, score: newScore }]
    }
    const { error } = await supabaseClient
      .from("players")
      .update({ scores: updatedScores })
      .eq("id", player.id)
      .select()

    setLoading(false)

    if (error) {
      setError(error)
      return
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
  audiofile_intro?: AudioFile
  audiofile_question?: AudioFile
  audiofile_outro?: AudioFile
  image?: string
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

export type DoorState = "closed" | "open" | "locked" | "answered"
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
    setLoading(true)
    const fetchDoorStates = async () => {
      if (player === null || year === null) {
        console.error("Missing player id or year", player, year)
        return
      }

      const { data, error } = await supabaseClient
        .from("players")
        .select("doors_opened")
        .eq("id", player.id)

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

        const matchedDoor = doorsOpened.find(
          (door: Door) =>
            door.year === year.year && door.door_number === doorNumber,
        )

        if (matchedDoor?.isAnswered === true) {
          return "answered"
        }

        return matchedDoor ? "open" : "closed"
      })

      setDoorStates(newDoorStates)
    }

    setLoading(false)
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

    if (isAlreadyOpened || doorStates[doorNumber] === "answered") {
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
    updatedDoorStates[doorNumber] = "open"
    setDoorStates(updatedDoorStates)
  }

  const lockDoorAfterAnswer = async (doorNumber: number) => {
    if (player === null || year === null) {
      console.error("Missing player id or year")
      return
    }

    let updatedDoors = player?.doors_opened || []

    // Find index of the existing door object with the same year and doorNumber
    const existingDoorIndex = updatedDoors.findIndex(
      (door) => door.year === year.year && door.door_number === doorNumber,
    )

    if (existingDoorIndex !== -1) {
      // Update the existing door object
      updatedDoors[existingDoorIndex] = {
        ...updatedDoors[existingDoorIndex],
        isAnswered: true,
      }
    } else {
      // Add a new door object if it doesn't exist
      updatedDoors = [
        ...updatedDoors,
        { year: year.year, door_number: doorNumber, isAnswered: true },
      ]
    }

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
    updatedDoorStates[doorNumber] = "answered"
    setDoorStates(updatedDoorStates)
  }

  return { doorStates, openDoor, lockDoorAfterAnswer, error, loading }
}
