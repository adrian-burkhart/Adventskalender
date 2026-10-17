"use server"

import { revalidatePath } from "next/cache"
import { isAdminEmail } from "@/lib/admins"
import { cleanComment, isReaction } from "@/lib/exchange"
import { missingForPlayer } from "@/lib/exchange-data"
import { getSession } from "@/lib/session"
import { createAdminClient } from "@/lib/supabase/admin"

// Everything players can do on the "Austausch" page. Each action returns
// an error text, or null. Only players who have answered every open door
// may write, edit or react; deleting is always allowed for the author and
// for admins.

const FAILED = "Das hat leider nicht geklappt. Bitte versuche es noch einmal."
const TOO_LONG = "Bitte schreib etwas (höchstens 1000 Zeichen)."
const CLOSED = "Bitte beantworte erst alle bisherigen Türchen."

/** The logged-in user, if the Austausch is open for them. */
async function member() {
  const { supabase, user } = await getSession()
  if (!user) return { user: null, error: "Bitte logge dich ein." }
  const { missing } = await missingForPlayer(supabase, user.id)
  if (missing.length > 0) return { user: null, error: CLOSED }
  return { user, error: null }
}

async function run(action: () => Promise<string | null>) {
  try {
    const error = await action()
    if (!error) revalidatePath("/austausch")
    return error
  } catch (error) {
    console.error("austausch", error)
    return FAILED
  }
}

export async function postComment(text: string): Promise<string | null> {
  const body = cleanComment(text)
  if (!body) return TOO_LONG
  return run(async () => {
    const { user, error } = await member()
    if (!user) return error
    const result = await createAdminClient()
      .from("comments")
      .insert({ player_id: user.id, body })
    if (result.error) throw result.error
    return null
  })
}

/** Only the author may change a comment. */
export async function editComment(
  id: number,
  text: string,
): Promise<string | null> {
  const body = cleanComment(text)
  if (!body) return TOO_LONG
  return run(async () => {
    const { user, error } = await member()
    if (!user) return error
    const result = await createAdminClient()
      .from("comments")
      .update({ body, edited_at: new Date().toISOString() })
      .eq("id", id)
      .eq("player_id", user.id)
      .select("id")
    if (result.error) throw result.error
    return result.data.length === 1 ? null : FAILED
  })
}

/** The author, or an admin. */
export async function deleteComment(id: number): Promise<string | null> {
  return run(async () => {
    const { user } = await getSession()
    if (!user) return "Bitte logge dich ein."
    let query = createAdminClient().from("comments").delete().eq("id", id)
    if (!isAdminEmail(user.email)) query = query.eq("player_id", user.id)
    const result = await query.select("id")
    if (result.error) throw result.error
    return result.data.length === 1 ? null : FAILED
  })
}

/** Adds the emoji to a comment, or takes it away again. */
export async function toggleReaction(
  id: number,
  emoji: string,
): Promise<string | null> {
  if (!isReaction(emoji)) return FAILED
  return run(async () => {
    const { user, error } = await member()
    if (!user) return error
    const reactions = createAdminClient().from("comment_reactions")
    const removed = await reactions
      .delete()
      .eq("comment_id", id)
      .eq("player_id", user.id)
      .eq("emoji", emoji)
      .select("emoji")
    if (removed.error) throw removed.error
    if (removed.data.length > 0) return null
    const added = await createAdminClient()
      .from("comment_reactions")
      .insert({ comment_id: id, player_id: user.id, emoji })
    if (added.error && added.error.code !== "23505") throw added.error
    return null
  })
}
