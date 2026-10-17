import { describe, expect, it } from "vitest"
import {
  canReadDoor,
  cleanComment,
  commentTarget,
  exchangeSeason,
} from "./exchange"

const at = (iso: string) => new Date(iso)

describe("commentTarget", () => {
  it("is the door of the day from 1 to 24 December", () => {
    expect(commentTarget(at("2025-12-22T09:00:00+01:00"))).toEqual({
      year: 2025,
      door: 22,
    })
    expect(commentTarget(at("2025-12-01T00:00:00+01:00"))).toEqual({
      year: 2025,
      door: 1,
    })
    expect(commentTarget(at("2025-12-24T23:59:00+01:00"))).toEqual({
      year: 2025,
      door: 24,
    })
  })

  it("follows Berlin time", () => {
    // 23:30 UTC on 30 November is already 1 December in Berlin.
    expect(commentTarget(at("2025-11-30T23:30:00Z"))).toEqual({
      year: 2025,
      door: 1,
    })
  })

  it("is the general corner on all other days", () => {
    expect(commentTarget(at("2025-12-25T10:00:00+01:00"))).toBeNull()
    expect(commentTarget(at("2026-01-01T10:00:00+01:00"))).toBeNull()
    expect(commentTarget(at("2026-10-17T10:00:00+02:00"))).toBeNull()
  })
})

describe("exchangeSeason", () => {
  it("is this year in December and last year before", () => {
    expect(exchangeSeason(at("2025-12-22T09:00:00+01:00"))).toBe(2025)
    expect(exchangeSeason(at("2025-12-31T09:00:00+01:00"))).toBe(2025)
    expect(exchangeSeason(at("2026-01-01T09:00:00+01:00"))).toBe(2025)
    expect(exchangeSeason(at("2026-11-30T09:00:00+01:00"))).toBe(2025)
  })
})

describe("canReadDoor", () => {
  it("opens a door's comments only once it is answered or the season is over", () => {
    expect(canReadDoor("answered")).toBe(true)
    expect(canReadDoor("past")).toBe(true)
    expect(canReadDoor("open")).toBe(false)
    expect(canReadDoor("closed")).toBe(false)
    expect(canReadDoor("locked")).toBe(false)
    expect(canReadDoor(undefined)).toBe(false)
  })
})

describe("cleanComment", () => {
  it("trims and rejects empty or long texts", () => {
    expect(cleanComment("  Schön! ")).toBe("Schön!")
    expect(cleanComment("   ")).toBeNull()
    expect(cleanComment(42)).toBeNull()
    expect(cleanComment("a".repeat(1000))).toHaveLength(1000)
    expect(cleanComment("a".repeat(1001))).toBeNull()
  })
})
