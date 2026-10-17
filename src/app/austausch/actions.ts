"use server"

import { revalidatePath } from "next/cache"
import { cleanComment } from "@/lib/exchange"
import { missingForPlayer } from "@/lib/exchange-data"
import { createAdminClient } from "@/lib/supabase/admin"
import { getSession } from "@/lib/session"

const FAILED = "Das hat leider nicht geklappt. Bitte versuche es noch einmal."

/**
 * Saves a comment, only for players who have answered every open door of
 * the year. Returns an error text, or null.
 */
export async function postComment(text: string): Promise<string | null> {
  const { supabase, user } = await getSession()
  if (!user) return "Bitte logge dich ein."

  const body = cleanComment(text)
  if (!body) return "Bitte schreib etwas (höchstens 1000 Zeichen)."

  try {
    const { missing } = await missingForPlayer(supabase, user.id)
    if (missing.length > 0) {
      return "Bitte beantworte erst alle bisherigen Türchen."
    }
    const { error } = await createAdminClient()
      .from("comments")
      .insert({ player_id: user.id, body })
    if (error) throw error
  } catch (error) {
    console.error("postComment", error)
    return FAILED
  }

  revalidatePath("/austausch")
  return null
}
