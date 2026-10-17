import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import { DateTime } from "luxon"
import { calendarNow } from "@/lib/clock"
import { loadDoorStates } from "@/lib/door-api"
import { TIME_ZONE, doorsUnlocked } from "@/lib/doors"
import { canReadDoor, commentTarget, exchangeSeason } from "@/lib/exchange"
import { createAdminClient } from "@/lib/supabase/admin"

export interface ExchangeComment {
  id: number
  name: string
  body: string
  /** Already formatted in Berlin time, e.g. "22.12., 09:14 Uhr". */
  time: string
  mine: boolean
}

export interface DoorThread {
  door: number
  count: number
  /** False until the player has answered the door: then comments is empty. */
  readable: boolean
  comments: ExchangeComment[]
}

export interface ExchangeData {
  season: number
  /** Today's door (1 to 24 December), or null: then comments are general. */
  today: number | null
  /** False on 1 to 24 December until today's door is answered. */
  canWrite: boolean
  doors: DoorThread[]
  general: ExchangeComment[]
}

interface Row {
  id: number
  created_at: string
  player_id: string
  year: number | null
  door: number | null
  body: string
  players: { name: string | null } | null
}

/**
 * Everything the "Austausch" page shows one player. The comments of a door
 * leave the server only for players who have answered that door.
 */
export async function loadExchange(
  supabase: SupabaseClient,
  userId: string,
): Promise<ExchangeData> {
  const now = calendarNow()
  const season = exchangeSeason(now)
  const target = commentTarget(now)

  const [states, { data, error }] = await Promise.all([
    loadDoorStates(supabase, userId, season, false),
    createAdminClient()
      .from("comments")
      .select("id, created_at, player_id, year, door, body, players(name)")
      .or(`year.eq.${season},year.is.null`)
      .order("created_at", { ascending: false })
      .returns<Row[]>(),
  ])
  if (error) throw error
  const rows = data ?? []

  const comment = (row: Row, withYear: boolean): ExchangeComment => ({
    id: row.id,
    name: row.players?.name ?? "Jemand",
    body: row.body,
    time: DateTime.fromISO(row.created_at)
      .setZone(TIME_ZONE)
      .toFormat(withYear ? "dd.MM.yyyy, HH:mm 'Uhr'" : "dd.MM., HH:mm 'Uhr'"),
    mine: row.player_id === userId,
  })

  const doors: DoorThread[] = []
  for (let door = doorsUnlocked(season, now); door >= 1; door--) {
    const thread = rows.filter((r) => r.door === door)
    if (thread.length === 0 && door !== target?.door) continue
    const readable = canReadDoor(states[door - 1])
    doors.push({
      door,
      count: thread.length,
      readable,
      comments: readable ? thread.map((r) => comment(r, false)) : [],
    })
  }

  return {
    season,
    today: target?.door ?? null,
    canWrite: !target || states[target.door - 1] === "answered",
    doors,
    general: rows.filter((r) => r.door === null).map((r) => comment(r, true)),
  }
}
