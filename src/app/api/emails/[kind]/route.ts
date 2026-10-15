import { NextResponse, type NextRequest } from "next/server"
import { isAdminEmail } from "@/lib/admins"
import { calendarNow } from "@/lib/clock"
import { reminderSeason, winnerSeason } from "@/lib/email-schedule"
import { reminderEmail, sendEmail, winnerEmail, type Email } from "@/lib/emails"
import { getSession } from "@/lib/session"
import { createAdminClient } from "@/lib/supabase/admin"

// Sending to the whole family can take a while (Resend: 2 mails a second).
export const maxDuration = 300

type Kind = "reminder" | "winner"

interface Letter {
  playerId: string
  name: string
  email: Email
}

/**
 * The season e-mails, sent by Vercel Cron (vercel.json):
 *
 * - reminder: daily in December, once per season to players who opened a
 *   door this year but none for three days.
 * - winner: on 1 January, the winner to everyone who took part.
 *
 * Only production sends to players. Outside production an admin can open
 * this URL while logged in: nobody else gets anything, the admin gets one
 * sample mail, and the answer lists who would have got one.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ kind: string }> },
) {
  const { kind } = await params
  if (kind !== "reminder" && kind !== "winner") {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const production = process.env.VERCEL_ENV === "production"
  const secret = process.env.CRON_SECRET
  const fromCron =
    !!secret && request.headers.get("authorization") === `Bearer ${secret}`

  let testTo: string | null = null
  if (!fromCron) {
    const { user } = await getSession()
    if (production || !user?.email || !isAdminEmail(user.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    testTo = user.email
  }

  const now = calendarNow()
  const requestedYear = Number(request.nextUrl.searchParams.get("year"))
  // Test runs default to this (staging) year, any time of year.
  const year = !production
    ? requestedYear || now.getFullYear()
    : kind === "reminder"
      ? reminderSeason(now)?.year
      : winnerSeason(now)
  if (!year) return NextResponse.json({ kind, sent: 0, reason: "off season" })

  const site = production
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : request.nextUrl.origin
  const letters =
    kind === "reminder"
      ? await reminders(year, reminderSeason(now)?.openDoors ?? 24, site)
      : await winners(year, site)

  if (!production) {
    // A test run: one sample to the admin, nothing to anyone else.
    if (testTo) {
      const sample = letters[0]?.email ?? sampleEmail(kind, year, site)
      await sendEmail({
        ...sample,
        to: testTo,
        subject: `[Test] ${sample.subject}`,
      })
    }
    return NextResponse.json({
      kind,
      year,
      wouldSendTo: letters.map((letter) => letter.name),
      sampleSentTo: testTo,
    })
  }

  const sent = await send(kind, year, letters)
  return NextResponse.json({ kind, year, sent })
}

async function reminders(
  year: number,
  openDoors: number,
  site: string,
): Promise<Letter[]> {
  const { data, error } = await createAdminClient().rpc("reminder_candidates", {
    p_year: year,
    p_open_doors: openDoors,
  })
  if (error) throw error
  return (data as { player_id: string; name: string; email: string }[]).map(
    (row) => ({
      playerId: row.player_id,
      name: row.name,
      email: reminderEmail({ to: row.email, name: row.name, url: site }),
    }),
  )
}

async function winners(year: number, site: string): Promise<Letter[]> {
  const { data, error } = await createAdminClient().rpc("season_players", {
    p_year: year,
  })
  if (error) throw error
  const players = data as {
    player_id: string
    name: string
    email: string
    score: number
    place: number
  }[]
  const top = players.filter((player) => player.place === 1)
  if (top.length === 0) return []
  return players.map((player) => ({
    playerId: player.player_id,
    name: player.name,
    email: winnerEmail({
      to: player.email,
      name: player.name,
      year,
      winners: top.map((winner) => winner.name),
      winnerScore: top[0].score,
      score: player.score,
      place: player.place,
      url: `${site}/rangliste`,
    }),
  }))
}

/** Each mail at most once: claimed in the log first, given back on failure. */
async function send(kind: Kind, year: number, letters: Letter[]) {
  const supabase = createAdminClient()
  let sent = 0
  for (const letter of letters) {
    const claim = { p_player: letter.playerId, p_year: year, p_kind: kind }
    const { data: claimed, error } = await supabase.rpc("claim_email", claim)
    if (error) throw error
    if (!claimed) continue
    try {
      await sendEmail(letter.email)
      sent++
    } catch (sendError) {
      console.error(sendError)
      await supabase.rpc("release_email", claim)
    }
    await new Promise((resolve) => setTimeout(resolve, 600))
  }
  return sent
}

function sampleEmail(kind: Kind, year: number, site: string): Email {
  return kind === "reminder"
    ? reminderEmail({ to: "", name: "Oma Gerda", url: site })
    : winnerEmail({
        to: "",
        name: "Opa Heinz",
        year,
        winners: ["Oma Gerda"],
        winnerScore: 610,
        score: 480,
        place: 4,
        url: `${site}/rangliste`,
      })
}
