import "server-only"
import { loadCalendarYears } from "@/lib/door-api"
import type { Player, Year, YearScore } from "@/lib/hooks"
import { getSession, type SessionUser } from "@/lib/session"

/** What every page of a logged-in player needs, sent along with the HTML. */
export interface AppData {
  user: SessionUser
  player: Player | null
  scores: YearScore[]
  years: Year[]
  currentYear: string
}

export async function loadAppData(): Promise<AppData | null> {
  const { supabase, user } = await getSession()
  if (!user) return null

  // One round of requests in parallel. A part that fails is left empty and
  // the page still renders; the error is logged.
  const [player, scores, calendar] = await Promise.all([
    supabase
      .from("players")
      .select("id, created_at, name")
      .eq("id", user.id)
      .maybeSingle<Player>()
      .then(({ data, error }) => {
        if (error) console.error("loadAppData player", error)
        return data
      }),
    supabase.rpc("my_scores").then(({ data, error }) => {
      if (error) console.error("loadAppData scores", error)
      return (data as YearScore[] | null) ?? []
    }),
    loadCalendarYears().catch((error) => {
      console.error("loadAppData years", error)
      return null
    }),
  ])

  return {
    user,
    player,
    scores,
    years: calendar?.years ?? [],
    currentYear: calendar?.currentYear ?? String(new Date().getFullYear()),
  }
}
