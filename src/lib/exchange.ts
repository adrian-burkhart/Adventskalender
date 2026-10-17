import { DateTime } from "luxon"
import { DOOR_COUNT, TIME_ZONE, type DoorState } from "@/lib/doors"

// The rules of the "Austausch" page. On 1 to 24 December comments belong to
// the door of the day; on all other days they go to the general corner.
// Nobody sees the comments of a door before answering it, so nothing gets
// spoiled; once the season is over, everyone sees everything.

export const COMMENT_MAX_LENGTH = 1000

/** Where a comment written now goes: today's door, or null for general. */
export function commentTarget(
  now: Date,
): { year: number; door: number } | null {
  const day = DateTime.fromJSDate(now).setZone(TIME_ZONE)
  if (day.month !== 12 || day.day > DOOR_COUNT) return null
  return { year: day.year, door: day.day }
}

/** The season whose doors the page shows: this December, or the last one. */
export function exchangeSeason(now: Date): number {
  const day = DateTime.fromJSDate(now).setZone(TIME_ZONE)
  return day.month === 12 ? day.year : day.year - 1
}

/** Whether a player may read the comments of a door in that state. */
export function canReadDoor(state: DoorState | undefined): boolean {
  return state === "answered" || state === "past"
}

/** Trims a comment; null when it is empty or too long. */
export function cleanComment(text: unknown): string | null {
  if (typeof text !== "string") return null
  const body = text.trim()
  if (!body || body.length > COMMENT_MAX_LENGTH) return null
  return body
}
