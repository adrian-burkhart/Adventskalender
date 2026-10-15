import { createClient } from "@sanity/client"
import { env } from "./env"

export interface DoorContent {
  answer: string
  options: string[]
  reward: number
}

/** The right answer of a door, straight from Sanity (never in the app). */
export async function doorContent(
  year: string,
  door: number,
): Promise<DoorContent> {
  const client = createClient({
    projectId: "jrlkjoz0",
    dataset: "production",
    apiVersion: "2025-01-01",
    useCdn: false,
    perspective: "published",
    token: env.sanityToken(),
  })
  const content = await client.fetch<DoorContent | null>(
    `(*[_type == "year" && year == $year][0].questions[]->)[door_number == $door][0]{
      answer,
      "options": answer_options,
      reward
    }`,
    { year, door },
  )
  if (!content) throw new Error(`No question for ${year}/${door} in Sanity`)
  return content
}
