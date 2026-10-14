import "server-only"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { DateTime } from "luxon"
import {
  DOOR_COUNT,
  TIME_ZONE,
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
import { parseDoorParams } from "@/lib/routes"
import { getQuestion, listYears, type QuestionContent } from "@/lib/sanity"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

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

function isAdmin(user: User): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  return !!user.email && admins.includes(user.email.toLowerCase())
}

/** Test mode: admins only. Doors open early and nothing is saved. */
function isTestMode(request: NextRequest, user: User): boolean {
  return request.headers.get("x-test-mode") === "1" && isAdmin(user)
}

async function currentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
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

export async function getYears() {
  const { user } = await currentUser()
  if (!user) return UNAUTHORIZED()
  try {
    // The calendar always shows the current year, even before its
    // questions exist in Sanity.
    const currentYear = String(
      DateTime.fromJSDate(calendarNow()).setZone(TIME_ZONE).year,
    )
    const years = await listYears()
    if (!years.some((y) => y.year === currentYear)) {
      years.push({ year: currentYear, questionCount: 0 })
    }
    return reply({ years, currentYear })
  } catch (error) {
    console.error("getYears", error)
    return FAILED()
  }
}

export async function getDoorStates(request: NextRequest, yearParam: string) {
  const { supabase, user } = await currentUser()
  if (!user) return UNAUTHORIZED()
  const year = Number(yearParam)
  if (!/^\d{4}$/.test(yearParam) || year < 2023 || year > 2100) {
    return reply({ error: "Unbekanntes Jahr" }, 404)
  }

  try {
    const testMode = isTestMode(request, user)
    const [{ data: rows, error }, legacy] = await Promise.all([
      supabase
        .from("answers")
        .select("door, answered_at")
        .eq("player_id", user.id)
        .eq("year", year),
      legacyDoors(supabase, user.id),
    ])
    if (error) throw error

    const now = calendarNow()
    const doors: DoorState[] = Array.from({ length: DOOR_COUNT }, (_, i) => {
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

    return reply({ doors })
  } catch (error) {
    console.error("getDoorStates", error)
    return FAILED()
  }
}

// --- One door --------------------------------------------------------------

interface DoorContext {
  request: NextRequest
  supabase: SupabaseClient
  user: User
  year: number
  door: number
  question: QuestionContent
  testMode: boolean
  now: Date
}

type DoorParams = Promise<{ year: string; door: string }>

async function withDoor(
  request: NextRequest,
  params: DoorParams,
  handler: (ctx: DoorContext) => Promise<DoorResponse>,
) {
  const { supabase, user } = await currentUser()
  if (!user) return UNAUTHORIZED()

  const { year: yearParam, door: doorParam } = await params
  const parsed = parseDoorParams(yearParam, doorParam)
  if (!parsed) return reply({ error: "Unbekannte Tür" }, 404)

  try {
    const question = await getQuestion(parsed.year, parsed.doorNumber)
    if (!question) return reply({ status: "missing" } satisfies DoorResponse)

    return reply(
      await handler({
        request,
        supabase,
        user,
        year: Number(parsed.year),
        door: parsed.doorNumber,
        question,
        testMode: isTestMode(request, user),
        now: new Date(),
      }),
    )
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

/** GET: where the player stands with this door. */
export function getDoor(request: NextRequest, params: DoorParams) {
  return withDoor(request, params, async (ctx) => {
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
  })
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
    const body = (await ctx.request.json().catch(() => ({}))) as {
      option?: unknown
      leftPage?: unknown
    }
    const selected =
      typeof body.option === "string" ? body.option.slice(0, 500) : null
    const leftPage = body.leftPage === true

    const result = (
      correct: boolean,
      points: number,
      score: number | null,
      timedOut: boolean,
    ): DoorResponse => ({
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
