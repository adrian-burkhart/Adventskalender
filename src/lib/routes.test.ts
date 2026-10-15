import { describe, expect, it } from "vitest"
import {
  doorPath,
  isPublicPath,
  legacyDoorRedirect,
  parseDoorParams,
} from "./routes"

describe("isPublicPath", () => {
  it.each(["/login", "/impressum", "/datenschutz", "/impressum/"])(
    "%s is public",
    (path) => expect(isPublicPath(path)).toBe(true),
  )

  it.each(["/auth/confirm", "/api/emails/reminder"])("%s is public", (path) =>
    expect(isPublicPath(path)).toBe(true),
  )

  it.each([
    "/",
    "/profile",
    "/rangliste",
    "/flags",
    "/2025/12",
    "/passwort-neu",
    "/api/auth/callback",
    "/loginx",
    "/authx",
  ])("%s needs a login", (path) => expect(isPublicPath(path)).toBe(false))
})

describe("parseDoorParams", () => {
  it("accepts doors 1 to 24", () => {
    expect(parseDoorParams("2025", "1")).toEqual({
      year: "2025",
      doorNumber: 1,
    })
    expect(parseDoorParams("2025", "24")).toEqual({
      year: "2025",
      doorNumber: 24,
    })
  })

  it.each([
    ["2025", "0"],
    ["2025", "25"],
    ["2025", "-1"],
    ["2025", "1.5"],
    ["25", "1"],
    ["abcd", "1"],
  ])("rejects %s/%s", (year, door) => {
    expect(parseDoorParams(year, door)).toBeNull()
  })
})

describe("legacyDoorRedirect", () => {
  it("maps the old /{year}{door} URLs", () => {
    expect(legacyDoorRedirect("/202512")).toBe("/2025/12")
    expect(legacyDoorRedirect("/20251")).toBe("/2025/1")
    expect(legacyDoorRedirect("/202524/")).toBe("/2025/24")
  })

  it("ignores everything else", () => {
    expect(legacyDoorRedirect("/202525")).toBeNull()
    expect(legacyDoorRedirect("/2025")).toBeNull()
    expect(legacyDoorRedirect("/2025/12")).toBeNull()
    expect(legacyDoorRedirect("/rangliste")).toBeNull()
  })
})

describe("doorPath", () => {
  it("builds /year/door", () => {
    expect(doorPath("2026", 3)).toBe(doorPath(2026, 3))
    expect(doorPath("2026", 3)).toBe("/2026/3")
  })
})
