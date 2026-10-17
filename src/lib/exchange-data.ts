import "server-only"
import type { SupabaseClient } from "@supabase/supabase-js"
import { DateTime } from "luxon"
import { isAdminEmail } from "@/lib/admins"
import { calendarNow } from "@/lib/clock"
import { loadDoorStates } from "@/lib/door-api"
import { TIME_ZONE, doorsUnlocked } from "@/lib/doors"
import { REACTIONS, missingDoors } from "@/lib/exchange"
import type { SessionUser } from "@/lib/session"
import { createAdminClient } from "@/lib/supabase/admin"

export interface Reaction {
  emoji: string
  count: number
  mine: boolean
  /** Who reacted, e.g. "Oma Gerda, Lukas". */
  names: string
}

export interface ExchangeComment {
  id: number
  name: string
  body: string
  /** Already formatted in Berlin time, e.g. "22.12.2025, 09:14 Uhr". */
  time: string
  edited: boolean
  mine: boolean
  /** Own comments, and every comment for admins. */
  canDelete: boolean
  /** Only the emojis someone used, in the order of REACTIONS. */
  reactions: Reaction[]
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
  edited_at: string | null
  player_id: string
  body: string
  players: { name: string | null } | null
}

interface ReactionRow {
  comment_id: number
  player_id: string
  emoji: string
  players: { name: string | null } | null
}

/**
 * What the "Austausch" page shows one player, oldest comment first. The
 * comments leave the server only for players who have answered every
 * open door.
 */
export async function loadExchange(
  supabase: SupabaseClient,
  user: SessionUser,
): Promise<ExchangeData> {
  const { year, missing } = await missingForPlayer(supabase, user.id)
  if (missing.length > 0) return { allowed: false, year, missing }

  const admin = createAdminClient()
  const [comments, reactions] = await Promise.all([
    admin
      .from("comments")
      .select("id, created_at, edited_at, player_id, body, players(name)")
      .order("created_at", { ascending: true })
      .returns<Row[]>(),
    admin
      .from("comment_reactions")
      .select("comment_id, player_id, emoji, players(name)")
      .order("created_at", { ascending: true })
      .returns<ReactionRow[]>(),
  ])
  if (comments.error) throw comments.error
  if (reactions.error) throw reactions.error

  const isAdmin = isAdminEmail(user.email)
  return {
    allowed: true,
    comments: (comments.data ?? []).map((row) => {
      const own = (reactions.data ?? []).filter((r) => r.comment_id === row.id)
      return {
        id: row.id,
        name: row.players?.name ?? "Jemand",
        body: row.body,
        time: DateTime.fromISO(row.created_at)
          .setZone(TIME_ZONE)
          .toFormat("dd.MM.yyyy, HH:mm 'Uhr'"),
        edited: row.edited_at !== null,
        mine: row.player_id === user.id,
        canDelete: row.player_id === user.id || isAdmin,
        reactions: REACTIONS.flatMap((emoji) => {
          const by = own.filter((r) => r.emoji === emoji)
          if (by.length === 0) return []
          return [
            {
              emoji,
              count: by.length,
              mine: by.some((r) => r.player_id === user.id),
              names: by.map((r) => r.players?.name ?? "Jemand").join(", "),
            },
          ]
        }),
      }
    }),
  }
}
