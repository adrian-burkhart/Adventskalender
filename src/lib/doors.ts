import { DateTime } from "luxon"

export const TIME_ZONE = "Europe/Berlin"
export const DOOR_COUNT = 24
/** Seconds a player has for a question once they press "Bereit". */
export const QUESTION_SECONDS = 30
/** Extra seconds the server accepts, for slow networks. */
export const GRACE_SECONDS = 3

export type DoorState = "closed" | "open" | "locked" | "answered"

/** Door N of a year opens at midnight Berlin time on N December. */
export function doorUnlocksAt(year: number, door: number): Date {
  return DateTime.fromObject(
    { year, month: 12, day: door },
    { zone: TIME_ZONE },
  ).toJSDate()
}

/** Doors can be answered late, up to the end of 31 December (Berlin). */
export function seasonEndsAt(year: number): Date {
  return DateTime.fromObject(
    { year: year + 1, month: 1, day: 1 },
    { zone: TIME_ZONE },
  ).toJSDate()
}

/** How many of the year's doors have opened by now (0 to 24). */
export function doorsUnlocked(year: number, now: Date): number {
  let count = 0
  for (let door = 1; door <= DOOR_COUNT; door++) {
    if (now >= doorUnlocksAt(year, door)) count = door
  }
  return count
}

/** The door of the day (1 to 24) in Berlin, or null outside 1 to 24 December. */
export function doorOfTheDay(year: number, now: Date): number | null {
  const day = DateTime.fromJSDate(now).setZone(TIME_ZONE)
  if (day.year !== year || day.month !== 12 || day.day > DOOR_COUNT) {
    return null
  }
  return day.day
}

export function isDoorAnswerable(year: number, door: number, now: Date) {
  return now >= doorUnlocksAt(year, door) && now < seasonEndsAt(year)
}

export function doorState({
  year,
  door,
  now,
  opened,
  answered,
}: {
  year: number
  door: number
  now: Date
  opened: boolean
  answered: boolean
}): DoorState {
  if (answered) return "answered"
  if (!isDoorAnswerable(year, door, now)) return "locked"
  return opened ? "open" : "closed"
}

export function questionDeadline(startedAt: Date): Date {
  return new Date(startedAt.getTime() + QUESTION_SECONDS * 1000)
}

export function isWithinDeadline(startedAt: Date, now: Date): boolean {
  return (
    now.getTime() <=
    questionDeadline(startedAt).getTime() + GRACE_SECONDS * 1000
  )
}

/** Compares answers without tripping over stray or doubled spaces. */
export function normalizeOption(value: string): string {
  return value.normalize("NFC").replace(/\s+/g, " ").trim()
}

export function isCorrectAnswer(
  selected: string | null | undefined,
  answer: string,
  options: string[],
): boolean {
  if (!selected) return false
  const choice = normalizeOption(selected)
  if (!options.some((option) => normalizeOption(option) === choice)) {
    return false
  }
  return choice === normalizeOption(answer)
}

export interface LegacyDoor {
  year: string | number
  door_number: number
  isAnswered?: boolean
}

/** Doors recorded by the old app in players.doors_opened (2023 to 2025). */
export function legacyDoorStatus(
  doorsOpened: LegacyDoor[] | null | undefined,
  year: number,
  door: number,
) {
  const entries = (doorsOpened ?? []).filter(
    (d) => Number(d?.year) === year && d?.door_number === door,
  )
  return {
    opened: entries.length > 0,
    answered: entries.some((d) => d.isAnswered === true),
  }
}
