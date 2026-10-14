import { redirect } from "next/navigation"
import Rangliste from "@/components/rangliste"
import { loadCalendarYears } from "@/lib/door-api"
import { calendarNow } from "@/lib/clock"
import { doorsUnlocked } from "@/lib/doors"
import type { LeaderboardEntry } from "@/lib/hooks"
import { getSession } from "@/lib/session"

// The current year's leaderboard comes with the page; other years load
// when they are picked.
export default async function Page() {
  const { supabase, user } = await getSession()
  if (!user) redirect("/login")

  const { currentYear } = await loadCalendarYears().catch(() => ({
    currentYear: String(new Date().getFullYear()),
  }))
  const [leaderboard, scoreYears] = await Promise.all([
    supabase.rpc("leaderboard", { p_year: Number(currentYear) }),
    supabase.rpc("score_years"),
  ])
  if (leaderboard.error) console.error("rangliste", leaderboard.error)

  return (
    <Rangliste
      initial={
        leaderboard.error
          ? undefined
          : {
              year: currentYear,
              entries: leaderboard.data as LeaderboardEntry[],
            }
      }
      scoreYears={(scoreYears.data as number[] | null) ?? []}
      currentYear={currentYear}
      unlockedNow={doorsUnlocked(Number(currentYear), calendarNow())}
    />
  )
}
