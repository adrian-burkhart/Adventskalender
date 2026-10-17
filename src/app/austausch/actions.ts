"use server"

import { revalidatePath } from "next/cache"
import { calendarNow } from "@/lib/clock"
import { loadDoorStates } from "@/lib/door-api"
import { cleanComment, commentTarget } from "@/lib/exchange"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSession } from "@/lib/session"

const FAILED = "Das hat leider nicht geklappt. Bitte versuche es noch einmal."

/**
 * Saves a comment. On 1 to 24 December it belongs to today's door and
 * only players who have answered that door may write; otherwise it goes
 * to the general corner. Returns an error text, or null.
 */
export async function postComment(text: string): Promise<string | null> {
  const { supabase, user } = await getSession()
  if (!user) return "Bitte logge dich ein."

  const body = cleanComment(text)
  if (!body) return "Bitte schreib etwas (höchstens 1000 Zeichen)."

  const target = commentTarget(calendarNow())
  try {
    if (target) {
      const states = await loadDoorStates(supabase, user.id, target.year, false)
      if (states[target.door - 1] !== "answered") {
        return `Beantworte erst Türchen ${target.door}, dann kannst du mitschreiben.`
      }
    }
    const { error } = await createAdminClient()
      .from("comments")
      .insert({
        player_id: user.id,
        year: target?.year ?? null,
        door: target?.door ?? null,
        body,
      })
    if (error) throw error
  } catch (error) {
    console.error("postComment", error)
    return FAILED
  }

  revalidatePath("/austausch")
  return null
}
