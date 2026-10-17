import type { DoorState } from "@/lib/doors"

// The rules of the "Austausch" page: one shared column of comments. Only
// players who have answered every door of the current year that is open so
// far may come in, so nothing in there can spoil a door for them.

export const COMMENT_MAX_LENGTH = 1000

/** The reactions under each comment. */
export const REACTIONS = ["😂", "❤️", "⛄", "🎄", "👍"] as const

/** Emojis to put into a comment with one tap. */
export const WRITE_EMOJIS = ["😂", "❤️", "⛄", "🎄", "👍", "🎅"]

export function isReaction(
  emoji: unknown,
): emoji is (typeof REACTIONS)[number] {
  return REACTIONS.includes(emoji as (typeof REACTIONS)[number])
}

/**
 * The open doors of the year a player hasn't answered yet, e.g. [20, 22].
 * Empty means they may come in. Outside December no door is open, so the
 * page is open for everyone.
 */
export function missingDoors(states: DoorState[], unlocked: number): number[] {
  return states
    .slice(0, unlocked)
    .flatMap((state, i) => (state === "answered" ? [] : [i + 1]))
}

/** Trims a comment; null when it is empty or too long. */
export function cleanComment(text: unknown): string | null {
  if (typeof text !== "string") return null
  const body = text.trim()
  if (!body || body.length > COMMENT_MAX_LENGTH) return null
  return body
}
