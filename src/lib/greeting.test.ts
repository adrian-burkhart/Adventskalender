import { describe, expect, it } from "vitest"
import { adventSunday, greeting } from "./greeting"

// Local times, as on the player's device.
const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h)

describe("adventSunday", () => {
  it("finds the four Advent Sundays", () => {
    // 2026: Christmas is a Friday, so the Advents are 29.11., 6., 13., 20.12.
    expect(adventSunday(at(2026, 11, 29))).toBe(1)
    expect(adventSunday(at(2026, 12, 6))).toBe(2)
    expect(adventSunday(at(2026, 12, 13))).toBe(3)
    expect(adventSunday(at(2026, 12, 20))).toBe(4)
    expect(adventSunday(at(2026, 11, 22))).toBeNull()
    expect(adventSunday(at(2026, 12, 27))).toBeNull()
    expect(adventSunday(at(2026, 12, 7))).toBeNull()
  })

  it("never counts Christmas Day", () => {
    // 2022: Christmas was a Sunday; the fourth Advent was 18 December.
    expect(adventSunday(at(2022, 12, 18))).toBe(4)
    expect(adventSunday(at(2022, 11, 27))).toBe(1)
    expect(adventSunday(at(2022, 12, 25))).toBeNull()
  })
})

describe("greeting", () => {
  it("greets by the time of day", () => {
    expect(greeting("Adrian", at(2026, 10, 16, 8))).toBe(
      "Guten Morgen, Adrian!",
    )
    expect(greeting("Adrian", at(2026, 10, 16, 14))).toBe("Hallo, Adrian!")
    expect(greeting("Adrian", at(2026, 10, 16, 20))).toBe(
      "Guten Abend, Adrian!",
    )
    expect(greeting("Adrian", at(2026, 10, 16, 2))).toBe("Hallo, Adrian!")
  })

  it("celebrates St Nicholas and the Advent Sundays all day", () => {
    expect(greeting("Adrian", at(2025, 12, 6, 8))).toBe(
      "Frohen Nikolaus, Adrian!",
    )
    expect(greeting("Adrian", at(2026, 11, 29, 20))).toBe(
      "Frohen ersten Advent, Adrian!",
    )
    expect(greeting("Adrian", at(2025, 12, 21, 9))).toBe(
      "Frohen vierten Advent, Adrian!",
    )
  })

  it("wishes both when St Nicholas is an Advent Sunday", () => {
    expect(greeting("Adrian", at(2026, 12, 6))).toBe(
      "Frohen Nikolaus und schönen zweiten Advent, Adrian!",
    )
  })
})
