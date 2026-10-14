import "server-only"
import { createClient } from "@sanity/client"
import { unstable_cache } from "next/cache"

// Content is read on the server only, so answers never reach the browser.
// The token allows reading a private dataset; without it, only a public one.
const client = createClient({
  projectId: "jrlkjoz0",
  dataset: process.env.SANITY_DATASET ?? "production",
  apiVersion: "2025-01-01",
  useCdn: true,
  perspective: "published",
  token: process.env.SANITY_API_READ_TOKEN,
})

export interface QuestionContent {
  question: string
  answer: string
  answerOptions: string[]
  reward: number
  introAudio: string | null
  questionAudio: string | null
  outroAudio: string | null
  image: string | null
}

export interface YearSummary {
  year: string
  questionCount: number
}

async function fetchYears(): Promise<YearSummary[]> {
  const years = await client.fetch<YearSummary[]>(
    `*[_type == "year" && defined(year)]{
      year,
      "questionCount": count(questions)
    }`,
  )
  return years
    .map((y) => ({ year: y.year, questionCount: y.questionCount ?? 0 }))
    .sort((a, b) => a.year.localeCompare(b.year))
}

async function fetchQuestion(
  year: string,
  door: number,
): Promise<QuestionContent | null> {
  const question = await client.fetch<QuestionContent | null>(
    `(*[_type == "year" && year == $year][0].questions[]->)[door_number == $door][0]{
      question,
      answer,
      "answerOptions": coalesce(answer_options, []),
      "reward": coalesce(reward, 0),
      "introAudio": audiofile_intro->audiofile.asset->url,
      "questionAudio": audiofile_question->audiofile.asset->url,
      "outroAudio": audiofile_outro->audiofile.asset->url,
      "image": image.asset->url
    }`,
    { year, door },
  )
  if (!question?.question || !question.answer) return null
  return question
}

// Content changes rarely, so each server instance keeps it for a minute
// instead of asking Sanity on every page load. Edits in the Studio show up
// within that minute.
const CONTENT_SECONDS = 60

export const listYears = unstable_cache(fetchYears, ["sanity-years"], {
  revalidate: CONTENT_SECONDS,
})

export const getQuestion = unstable_cache(fetchQuestion, ["sanity-question"], {
  revalidate: CONTENT_SECONDS,
})
