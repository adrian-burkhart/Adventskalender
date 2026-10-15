import { redirect } from "next/navigation"
import Ruhmeshalle, { type HallEntry } from "@/components/ruhmeshalle"
import { calendarNow } from "@/lib/clock"
import { seasonEndsAt } from "@/lib/doors"
import type { LeaderboardEntry } from "@/lib/hooks"
import { getSession } from "@/lib/session"

// The winners of every season that is over, newest first.
export default async function Page() {
  const { supabase, user } = await getSession()
  if (!user) redirect("/login")

  const { data: years } = await supabase.rpc("score_years")
  const now = calendarNow()
  const finished = ((years as number[] | null) ?? [])
    .filter((year) => now >= seasonEndsAt(year))
    .sort((a, b) => b - a)

  const boards = await Promise.all(
    finished.map(async (year) => {
      const { data, error } = await supabase.rpc("leaderboard", {
        p_year: year,
      })
      if (error) console.error("ruhmeshalle", year, error)
      return { year, entries: (data as LeaderboardEntry[] | null) ?? [] }
    }),
  )

  const entries: HallEntry[] = boards.flatMap(({ year, entries }) => {
    const top = entries[0]?.score ?? 0
    if (top <= 0) return []
    return [
      {
        year,
        winners: entries.filter((e) => e.score === top).map((e) => e.name),
        score: top,
      },
    ]
  })

  return (
    <Ruhmeshalle
      entries={entries}
      // Staging has hardly any finished seasons: show example winners too.
      withExamples={process.env.VERCEL_ENV !== "production"}
    />
  )
}
