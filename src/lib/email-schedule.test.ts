import { describe, expect, it } from "vitest"
import { reminderSeason, winnerSeason } from "./email-schedule"

const at = (iso: string) => new Date(iso)

describe("reminderSeason", () => {
  it("is off before 4 December and after 28 December", () => {
    expect(reminderSeason(at("2026-12-03T12:00:00+01:00"))).toBeNull()
    expect(reminderSeason(at("2026-12-29T12:00:00+01:00"))).toBeNull()
    expect(reminderSeason(at("2026-11-20T12:00:00+01:00"))).toBeNull()
  })

  it("counts the doors open so far", () => {
    expect(reminderSeason(at("2026-12-04T09:00:00+01:00"))).toEqual({
      year: 2026,
      openDoors: 4,
    })
    expect(reminderSeason(at("2026-12-27T09:00:00+01:00"))).toEqual({
      year: 2026,
      openDoors: 24,
    })
  })

  it("uses the date in Berlin", () => {
    // 23:30 UTC on 3 December is already 4 December in Berlin.
    expect(reminderSeason(at("2026-12-03T23:30:00Z"))?.openDoors).toBe(4)
  })
})

describe("winnerSeason", () => {
  it("announces last year's winner in early January", () => {
    expect(winnerSeason(at("2027-01-01T10:00:00+01:00"))).toBe(2026)
    expect(winnerSeason(at("2027-01-08T10:00:00+01:00"))).toBeNull()
    expect(winnerSeason(at("2026-12-31T23:30:00+01:00"))).toBeNull()
  })
})
