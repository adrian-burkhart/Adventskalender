import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import { DateTime } from "luxon"
import { calendarNow } from "@/lib/clock"
import { loadDoorStates } from "@/lib/door-api"
import { TIME_ZONE, doorsUnlocked } from "@/lib/doors"
import { missingDoors } from "@/lib/exchange"
import { createAdminClient } from "@/lib/supabase/admin"

export interface ExchangeComment {
  id: number
  name: string
  body: string
  /** Already formatted in Berlin time, e.g. "22.12.2025, 09:14 Uhr". */
  time: string
  mine: boolean
}

export type ExchangeData =
  | { allowed: true; comments: ExchangeComment[] }
  /** Not answered yet: the open doors of this year, e.g. [20, 22]. */
  | { allowed: false; year: number; missing: number[] }

/** The open doors of this year the player still has to answer. */
export async function missingForPlayer(
  supabase: SupabaseClient,
  userId: string,
) {
  const now = calendarNow()
  const year = DateTime.fromJSDate(now).setZone(TIME_ZONE).year
  const states = await loadDoorStates(supabase, userId, year, false)
  return { year, missing: missingDoors(states, doorsUnlocked(year, now)) }
}

interface Row {
  id: number
  created_at: string
  player_id: string
  body: string
  players: { name: string | null } | null
}

/**
 * What the "Austausch" page shows one player. The comments leave the
 * server only for players who have answered every open door.
 */
export async function loadExchange(
  supabase: SupabaseClient,
  userId: string,
): Promise<ExchangeData> {
  const { year, missing } = await missingForPlayer(supabase, userId)
  if (missing.length > 0) return { allowed: false, year, missing }

  const { data, error } = await createAdminClient()
    .from("comments")
    .select("id, created_at, player_id, body, players(name)")
    .order("created_at", { ascending: false })
    .returns<Row[]>()
  if (error) throw error

  return {
    allowed: true,
    comments: (data ?? []).map((row) => ({
      id: row.id,
      name: row.players?.name ?? "Jemand",
      body: row.body,
      time: DateTime.fromISO(row.created_at)
        .setZone(TIME_ZONE)
        .toFormat("dd.MM.yyyy, HH:mm 'Uhr'"),
      mine: row.player_id === userId,
    })),
  }
}
