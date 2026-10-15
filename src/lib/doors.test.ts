import { describe, expect, it } from "vitest"
import {
  doorOfTheDay,
  doorsUnlocked,
  doorState,
  hasDecorations,
  doorUnlocksAt,
  isCorrectAnswer,
  isDoorAnswerable,
  isWithinDeadline,
  legacyDoorStatus,
  normalizeOption,
  questionDeadline,
  seasonEndsAt,
} from "./doors"

const at = (iso: string) => new Date(iso)

describe("unlock times (Europe/Berlin)", () => {
  it("opens a door at midnight Berlin time, which is 23:00 UTC the day before", () => {
    expect(doorUnlocksAt(2026, 1).toISOString()).toBe(
      "2026-11-30T23:00:00.000Z",
    )
    expect(doorUnlocksAt(2026, 24).toISOString()).toBe(
      "2026-12-23T23:00:00.000Z",
    )
  })

  it("ends the season at midnight on 1 January", () => {
    expect(seasonEndsAt(2026).toISOString()).toBe("2026-12-31T23:00:00.000Z")
  })

  it("keeps a door shut one second before midnight in Berlin", () => {
    expect(isDoorAnswerable(2026, 3, at("2026-12-02T22:59:59Z"))).toBe(false)
    expect(isDoorAnswerable(2026, 3, at("2026-12-02T23:00:00Z"))).toBe(true)
  })

  it("ignores the device clock and its time zone", () => {
    // 10:00 UTC on 2 Dec is still 2 Dec in Berlin: door 3 stays shut.
    expect(isDoorAnswerable(2026, 3, at("2026-12-02T10:00:00Z"))).toBe(false)
  })

  it("accepts late answers until the end of 31 December", () => {
    expect(isDoorAnswerable(2026, 1, at("2026-12-31T22:59:59Z"))).toBe(true)
    expect(isDoorAnswerable(2026, 1, at("2026-12-31T23:00:00Z"))).toBe(false)
  })

  it("keeps future years shut", () => {
    expect(isDoorAnswerable(2027, 1, at("2026-12-10T12:00:00Z"))).toBe(false)
  })
})

describe("doorState", () => {
  const now = at("2026-12-05T12:00:00Z")
  const base = { year: 2026, now, opened: false, answered: false }

  it("locks doors that haven't opened yet", () => {
    expect(doorState({ ...base, door: 6 })).toBe("locked")
  })

  it("shows unlocked doors as closed or open", () => {
    expect(doorState({ ...base, door: 5 })).toBe("closed")
    expect(doorState({ ...base, door: 5, opened: true })).toBe("open")
  })

  it("always shows answered doors as answered", () => {
    expect(doorState({ ...base, door: 5, answered: true })).toBe("answered")
    expect(doorState({ ...base, year: 2025, door: 5, answered: true })).toBe(
      "answered",
    )
  })

  it("leaves unanswered doors of a past season to listen to", () => {
    expect(doorState({ ...base, year: 2025, door: 5, opened: true })).toBe(
      "past",
    )
    expect(doorState({ ...base, year: 2025, door: 24 })).toBe("past")
  })
})

describe("question deadline", () => {
  const started = at("2026-12-05T12:00:00Z")

  it("is 30 seconds after Bereit", () => {
    expect(questionDeadline(started).toISOString()).toBe(
      "2026-12-05T12:00:30.000Z",
    )
  })

  it("allows a few seconds of network delay, not more", () => {
    expect(isWithinDeadline(started, at("2026-12-05T12:00:33Z"))).toBe(true)
    expect(isWithinDeadline(started, at("2026-12-05T12:00:34Z"))).toBe(false)
  })
})

describe("isCorrectAnswer", () => {
  const options = ["Rudolph", "Dasher ", "Comet"]

  it("matches despite stray spaces in the CMS", () => {
    expect(isCorrectAnswer("Dasher ", "Dasher", options)).toBe(true)
    expect(isCorrectAnswer("Dasher", "Dasher  ", options)).toBe(true)
  })

  it("rejects wrong, empty and invented answers", () => {
    expect(isCorrectAnswer("Comet", "Dasher", options)).toBe(false)
    expect(isCorrectAnswer(null, "Dasher", options)).toBe(false)
    expect(isCorrectAnswer("", "Dasher", options)).toBe(false)
    // Not one of the options, even if it equals the answer text.
    expect(isCorrectAnswer("Blitzen", "Blitzen", options)).toBe(false)
  })

  it("normalizes whitespace and unicode", () => {
    expect(normalizeOption("  Oh  Tannenbaum ")).toBe("Oh Tannenbaum")
    expect(normalizeOption("München")).toBe("München")
  })
})

describe("legacyDoorStatus", () => {
  const doors = [
    { year: "2025", door_number: 3 },
    { year: "2025", door_number: 4, isAnswered: true },
    { year: 2024, door_number: 3, isAnswered: true },
  ]

  it("reads the old doors_opened list", () => {
    expect(legacyDoorStatus(doors, 2025, 3)).toEqual({
      opened: true,
      answered: false,
    })
    expect(legacyDoorStatus(doors, 2025, 4)).toEqual({
      opened: true,
      answered: true,
    })
    expect(legacyDoorStatus(doors, 2024, 3).answered).toBe(true)
    expect(legacyDoorStatus(null, 2025, 3)).toEqual({
      opened: false,
      answered: false,
    })
  })
})

describe("door of the day", () => {
  it("follows the Berlin date, not UTC", () => {
    // 23:30 UTC on 4 December is already 5 December in Berlin.
    expect(doorOfTheDay(2026, at("2026-12-04T23:30:00Z"))).toBe(5)
    expect(doorOfTheDay(2026, at("2026-12-01T08:00:00+01:00"))).toBe(1)
    expect(doorOfTheDay(2026, at("2026-12-24T20:00:00+01:00"))).toBe(24)
  })

  it("has no door of the day outside 1 to 24 December of that year", () => {
    expect(doorOfTheDay(2026, at("2026-11-30T12:00:00+01:00"))).toBeNull()
    expect(doorOfTheDay(2026, at("2026-12-25T12:00:00+01:00"))).toBeNull()
    expect(doorOfTheDay(2025, at("2026-12-05T12:00:00+01:00"))).toBeNull()
  })
})

describe("doors unlocked so far", () => {
  it("counts the doors that have opened", () => {
    expect(doorsUnlocked(2026, at("2026-11-30T12:00:00+01:00"))).toBe(0)
    expect(doorsUnlocked(2026, at("2026-12-10T09:00:00+01:00"))).toBe(10)
    expect(doorsUnlocked(2026, at("2027-01-05T09:00:00+01:00"))).toBe(24)
  })
})

describe("hasDecorations", () => {
  it("shows the tree from 2026 on and for the season of now", () => {
    expect(hasDecorations(2023, 2026)).toBe(false)
    expect(hasDecorations(2025, 2026)).toBe(false)
    expect(hasDecorations(2026, 2027)).toBe(true)
    expect(hasDecorations(2025, 2025)).toBe(true)
  })
})
