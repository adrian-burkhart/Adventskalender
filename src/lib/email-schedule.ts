import { DateTime } from "luxon"
import { DOOR_COUNT, TIME_ZONE } from "./doors"

/**
 * First and last day (December, Berlin) on which reminders go out. Five
 * doors can be missed at the earliest on 6 December (door 1 opened, 2 to 6
 * not).
 */
const REMINDER_FIRST_DAY = 6
const REMINDER_LAST_DAY = 28

/**
 * Whether reminders go out today, and for which year. Not in the first
 * days, and not so late that nobody could catch up by 31 December.
 */
export function reminderSeason(
  now: Date,
): { year: number; openDoors: number } | null {
  const day = DateTime.fromJSDate(now).setZone(TIME_ZONE)
  if (
    day.month !== 12 ||
    day.day < REMINDER_FIRST_DAY ||
    day.day > REMINDER_LAST_DAY
  ) {
    return null
  }
  return { year: day.year, openDoors: Math.min(day.day, DOOR_COUNT) }
}

/**
 * The year whose winner is announced today. Answers count until the end of
 * 31 December, so the winner is known on 1 January; a few days of slack
 * cover a missed run.
 */
export function winnerSeason(now: Date): number | null {
  const day = DateTime.fromJSDate(now).setZone(TIME_ZONE)
  if (day.month !== 1 || day.day > 7) return null
  return day.year - 1
}
