import { describe, expect, it } from "vitest"
import type { DoorState } from "./doors"
import { cleanComment, isReaction, missingDoors } from "./exchange"

const year = (answered: number[], unlocked: number): DoorState[] =>
  Array.from({ length: 24 }, (_, i) =>
    answered.includes(i + 1) ? "answered" : i < unlocked ? "closed" : "locked",
  )

describe("missingDoors", () => {
  it("lists the open doors that aren't answered yet", () => {
    expect(missingDoors(year([1, 2, 3, 5], 5), 5)).toEqual([4])
    expect(missingDoors(year([], 3), 3)).toEqual([1, 2, 3])
  })

  it("lets players in who answered every open door", () => {
    expect(missingDoors(year([1, 2, 3], 3), 3)).toEqual([])
  })

  it("counts an opened but unanswered door as missing", () => {
    const states = year([1], 2)
    states[1] = "open"
    expect(missingDoors(states, 2)).toEqual([2])
  })

  it("is open for everyone while no door of the year is open", () => {
    expect(missingDoors(year([], 0), 0)).toEqual([])
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

describe("isReaction", () => {
  it("accepts only the offered emojis", () => {
    expect(isReaction("❤️")).toBe(true)
    expect(isReaction("⛄")).toBe(true)
    expect(isReaction("💩")).toBe(false)
    expect(isReaction(undefined)).toBe(false)
  })
})
