import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { DateTime } from "luxon"
import { cache } from "react"
import {
  DOOR_COUNT,
  TIME_ZONE,
  doorOfTheDay,
  doorState,
  isCorrectAnswer,
  isDoorAnswerable,
  isWithinDeadline,
  legacyDoorStatus,
  normalizeOption,
  questionDeadline,
  type DoorState,
  type LegacyDoor,
} from "@/lib/doors"
import { calendarNow } from "@/lib/clock"
import { rankOf } from "@/lib/ranking"
import { parseDoorParams } from "@/lib/routes"
import { getQuestion, listYears, type QuestionContent } from "@/lib/sanity"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSession, type SessionUser } from "@/lib/session"

// The answer routes. The browser only ever gets what the current step needs:
// the intro audio, then the question and options, then the result. The
// correct answer, outro audio and solution image only come after answering.

export type DoorResponse =
  | { status: "missing" }
  | { status: "locked" }
  | { status: "answered" }
  | { status: "intro"; introAudio: string | null }
  | {
      status: "question"
      question: string
      options: string[]
      questionAudio: string | null
      deadline: string
      now: string
    }
  | {
      status: "result"
      isCorrect: boolean
      correctAnswer: string
      reward: number
      points: number
      score: number | null
      outroAudio: string | null
      image: string | null
      leftPage: boolean
      timedOut: boolean
      /** Place in this year's Rangliste after the answer; ties share one. */
      rank: number | null
      playerCount: number | null
      /** This year's answered doors, for the tree on the result screen. */
      season: SeasonDoor[]
    }

export interface SeasonDoor {
  door: number
  correct: boolean
}

function reply(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "cache-control": "no-store" },
  })
}

const UNAUTHORIZED = () => reply({ error: "Bitte logge dich ein." }, 401)
const FAILED = () =>
  reply(
    {
      error:
        "Da ist leider etwas schiefgelaufen. Bitte versuche es noch einmal.",
    },
    500,
  )

function isAdmin(user: SessionUser): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  return !!user.email && admins.includes(user.email.toLowerCase())
}

/** Test mode: admins only. Doors open early and nothing is saved. */
function isTestMode(request: NextRequest, user: SessionUser): boolean {
  return request.headers.get("x-test-mode") === "1" && isAdmin(user)
}

async function legacyDoors(
  supabase: SupabaseClient,
  userId: string,
): Promise<LegacyDoor[]> {
  const { data, error } = await supabase
    .from("players")
    .select("doors_opened")
    .eq("id", userId)
    .maybeSingle()
  if (error) throw error
  return (data?.doors_opened as LegacyDoor[] | null) ?? []
}

// --- Calendar --------------------------------------------------------------

/** The years in Sanity, plus the current one, which the calendar shows. */
export const loadCalendarYears = cache(async () => {
  // The calendar always shows the current year, even before its
  // questions exist in Sanity.
  const currentYear = String(
    DateTime.fromJSDate(calendarNow()).setZone(TIME_ZONE).year,
  )
  const years = [...(await listYears())]
  if (!years.some((y) => y.year === currentYear)) {
    years.push({ year: currentYear, questionCount: 0 })
  }
  return { years, currentYear }
})

/** The state of all 24 doors of one year for one player. */
export async function loadDoorStates(
  supabase: SupabaseClient,
  userId: string,
  year: number,
  testMode: boolean,
): Promise<DoorState[]> {
  const [{ data: rows, error }, legacy] = await Promise.all([
    supabase
      .from("answers")
      .select("door, answered_at")
      .eq("player_id", userId)
      .eq("year", year),
    legacyDoors(supabase, userId),
  ])
  if (error) throw error

  const now = calendarNow()
  return Array.from({ length: DOOR_COUNT }, (_, i) => {
    const door = i + 1
    const row = rows?.find((r) => r.door === door)
    const old = legacyDoorStatus(legacy, year, door)
    const state = doorState({
      year,
      door,
      now,
      opened: !!row || old.opened,
      answered: !!row?.answered_at || old.answered,
    })
    return testMode && state === "locked" ? "closed" : state
  })
}

/** Today's door in that year, by the calendar's clock. */
export function loadToday(year: number): number | null {
  return doorOfTheDay(year, calendarNow())
}

export async function getYears() {
  const { user } = await getSession()
  if (!user) return UNAUTHORIZED()
  try {
    return reply(await loadCalendarYears())
  } catch (error) {
    console.error("getYears", error)
    return FAILED()
  }
}

export async function getDoorStates(request: NextRequest, yearParam: string) {
  const { supabase, user } = await getSession()
  if (!user) return UNAUTHORIZED()
  const year = Number(yearParam)
  if (!/^\d{4}$/.test(yearParam) || year < 2023 || year > 2100) {
    return reply({ error: "Unbekanntes Jahr" }, 404)
  }

  try {
    const doors = await loadDoorStates(
      supabase,
      user.id,
      year,
      isTestMode(request, user),
    )
    return reply({ doors, today: loadToday(year) })
  } catch (error) {
    console.error("getDoorStates", error)
    return FAILED()
  }
}

// --- One door --------------------------------------------------------------

interface DoorContext {
  supabase: SupabaseClient
  user: SessionUser
  year: number
  door: number
  question: QuestionContent
  testMode: boolean
  now: Date
}

type DoorParams = Promise<{ year: string; door: string }>

/** Everything a door step needs, or null when the question is missing. */
async function loadDoorContext(
  supabase: SupabaseClient,
  user: SessionUser,
  year: string,
  door: number,
  testMode: boolean,
): Promise<DoorContext | null> {
  const question = await getQuestion(year, door)
  if (!question) return null
  return {
    supabase,
    user,
    year: Number(year),
    door,
    question,
    testMode,
    now: new Date(),
  }
}

async function withDoor(
  request: NextRequest,
  params: DoorParams,
  handler: (ctx: DoorContext) => Promise<DoorResponse>,
) {
  const { supabase, user } = await getSession()
  if (!user) return UNAUTHORIZED()

  const { year: yearParam, door: doorParam } = await params
  const parsed = parseDoorParams(yearParam, doorParam)
  if (!parsed) return reply({ error: "Unbekannte Tür" }, 404)

  try {
    const ctx = await loadDoorContext(
      supabase,
      user,
      parsed.year,
      parsed.doorNumber,
      isTestMode(request, user),
    )
    if (!ctx) return reply({ status: "missing" } satisfies DoorResponse)
    return reply(await handler(ctx))
  } catch (error) {
    console.error("door route", error)
    return FAILED()
  }
}

interface Progress {
  startedAt: Date | null
  answered: boolean
}

async function loadProgress(ctx: DoorContext): Promise<Progress> {
  const [{ data: row, error }, legacy] = await Promise.all([
    ctx.supabase
      .from("answers")
      .select("started_at, answered_at")
      .eq("player_id", ctx.user.id)
      .eq("year", ctx.year)
      .eq("door", ctx.door)
      .maybeSingle(),
    legacyDoors(ctx.supabase, ctx.user.id),
  ])
  if (error) throw error
  return {
    startedAt: row?.started_at ? new Date(row.started_at) : null,
    answered:
      !!row?.answered_at ||
      legacyDoorStatus(legacy, ctx.year, ctx.door).answered,
  }
}

function questionStep(
  ctx: DoorContext,
  startedAt: Date,
): Extract<DoorResponse, { status: "question" }> {
  return {
    status: "question",
    question: ctx.question.question,
    options: ctx.question.answerOptions,
    questionAudio: ctx.question.questionAudio,
    deadline: questionDeadline(startedAt).toISOString(),
    now: ctx.now.toISOString(),
  }
}

async function recordAnswer(
  ctx: DoorContext,
  answer: { selected: string | null; correct: boolean; leftPage: boolean },
) {
  const points = answer.correct ? ctx.question.reward : 0
  const { data, error } = await createAdminClient()
    .rpc("record_answer", {
      p_player: ctx.user.id,
      p_year: ctx.year,
      p_door: ctx.door,
      p_selected: answer.selected,
      p_correct: answer.correct,
      p_points: points,
      p_left_page: answer.leftPage,
    })
    .single<{ recorded: boolean; year_score: number }>()
  if (error) throw error
  return { recorded: data.recorded, score: data.year_score, points }
}

/**
 * The player's place in the year's Rangliste and their answered doors, for
 * the result screen. Ties share a place. Missing data leaves them empty;
 * the result still shows.
 */
async function standing(ctx: DoorContext): Promise<{
  rank: number | null
  playerCount: number | null
  season: SeasonDoor[]
}> {
  const [board, answers] = await Promise.all([
    ctx.supabase.rpc("leaderboard", { p_year: ctx.year }),
    ctx.supabase
      .from("answers")
      .select("door, is_correct")
      .eq("player_id", ctx.user.id)
      .eq("year", ctx.year)
      .not("answered_at", "is", null)
      .order("door"),
  ])
  if (board.error) console.error("standing leaderboard", board.error)
  if (answers.error) console.error("standing answers", answers.error)

  // Only players who took part this year; the Rangliste also lists the rest.
  const entries = (
    (board.data ?? []) as {
      player_id: string | null
      score: number
      doors: number
    }[]
  ).filter((entry) => entry.score > 0 || entry.doors > 0)
  const mine = entries.find((entry) => entry.player_id === ctx.user.id)
  return {
    rank: mine ? rankOf(mine.score, entries) : null,
    playerCount: entries.length > 0 ? entries.length : null,
    season: (answers.data ?? []).map((row) => ({
      door: row.door as number,
      correct: row.is_correct === true,
    })),
  }
}

/** Where the player stands with this door. */
async function doorStep(ctx: DoorContext): Promise<DoorResponse> {
  if (ctx.testMode) {
    return { status: "intro", introAudio: ctx.question.introAudio }
  }

  const progress = await loadProgress(ctx)
  if (progress.answered) return { status: "answered" }
  if (!isDoorAnswerable(ctx.year, ctx.door, calendarNow())) {
    return { status: "locked" }
  }

  if (progress.startedAt) {
    if (isWithinDeadline(progress.startedAt, ctx.now)) {
      return questionStep(ctx, progress.startedAt)
    }
    // Time ran out while the page was closed: that counts as wrong.
    await recordAnswer(ctx, {
      selected: null,
      correct: false,
      leftPage: false,
    })
    return { status: "answered" }
  }

  return { status: "intro", introAudio: ctx.question.introAudio }
}

/** GET: where the player stands with this door. */
export function getDoor(request: NextRequest, params: DoorParams) {
  return withDoor(request, params, doorStep)
}

/**
 * The first step of a door for the server-rendered door page, without test
 * mode (the browser asks the API again when it is on). Null when it fails;
 * the page then asks the API.
 */
export async function initialDoorStep(
  year: string,
  door: number,
): Promise<DoorResponse | null> {
  const { supabase, user } = await getSession()
  if (!user) return null
  try {
    const ctx = await loadDoorContext(supabase, user, year, door, false)
    if (!ctx) return { status: "missing" }
    return await doorStep(ctx)
  } catch (error) {
    console.error("initialDoorStep", error)
    return null
  }
}

/** POST: the door was clicked in the calendar. */
export function openDoor(request: NextRequest, params: DoorParams) {
  return withDoor(request, params, async (ctx) => {
    if (ctx.testMode) {
      return { status: "intro", introAudio: ctx.question.introAudio }
    }
    if (!isDoorAnswerable(ctx.year, ctx.door, calendarNow())) {
      return { status: "locked" }
    }
    const { error } = await createAdminClient().rpc("open_door", {
      p_player: ctx.user.id,
      p_year: ctx.year,
      p_door: ctx.door,
    })
    if (error) throw error
    return { status: "intro", introAudio: ctx.question.introAudio }
  })
}

/** POST: "Bereit" was pressed. The timer starts once and never restarts. */
export function startQuestion(request: NextRequest, params: DoorParams) {
  return withDoor(request, params, async (ctx) => {
    if (ctx.testMode) return questionStep(ctx, ctx.now)

    const progress = await loadProgress(ctx)
    if (progress.answered) return { status: "answered" }
    if (!isDoorAnswerable(ctx.year, ctx.door, calendarNow())) {
      return { status: "locked" }
    }

    const { data, error } = await createAdminClient()
      .rpc("start_question", {
        p_player: ctx.user.id,
        p_year: ctx.year,
        p_door: ctx.door,
      })
      .single<{ started_at: string; answered_at: string | null }>()
    if (error) throw error
    if (data.answered_at) return { status: "answered" }

    const startedAt = new Date(data.started_at)
    if (!isWithinDeadline(startedAt, ctx.now)) {
      await recordAnswer(ctx, {
        selected: null,
        correct: false,
        leftPage: false,
      })
      return { status: "answered" }
    }
    return questionStep(ctx, startedAt)
  })
}

/** POST: the answer, or `leftPage` when the player switched away. */
export function submitAnswer(request: NextRequest, params: DoorParams) {
  return withDoor(request, params, async (ctx) => {
    const body = (await request.json().catch(() => ({}))) as {
      option?: unknown
      leftPage?: unknown
    }
    const selected =
      typeof body.option === "string" ? body.option.slice(0, 500) : null
    const leftPage = body.leftPage === true

    const result = async (
      correct: boolean,
      points: number,
      score: number | null,
      timedOut: boolean,
    ): Promise<DoorResponse> => ({
      status: "result",
      isCorrect: correct,
      correctAnswer: normalizeOption(ctx.question.answer),
      reward: ctx.question.reward,
      points,
      score,
      outroAudio: ctx.question.outroAudio,
      image: ctx.question.image,
      leftPage,
      timedOut,
      ...(await standing(ctx)),
    })

    if (ctx.testMode) {
      const correct =
        !leftPage &&
        isCorrectAnswer(
          selected,
          ctx.question.answer,
          ctx.question.answerOptions,
        )
      return result(correct, correct ? ctx.question.reward : 0, null, false)
    }

    const progress = await loadProgress(ctx)
    if (progress.answered) return { status: "answered" }
    if (!progress.startedAt)
      return { status: "intro", introAudio: ctx.question.introAudio }

    const timedOut = !isWithinDeadline(progress.startedAt, ctx.now)
    const correct =
      !leftPage &&
      !timedOut &&
      isCorrectAnswer(selected, ctx.question.answer, ctx.question.answerOptions)

    const saved = await recordAnswer(ctx, { selected, correct, leftPage })
    if (!saved.recorded) return { status: "answered" }
    return result(correct, saved.points, saved.score, timedOut)
  })
}
