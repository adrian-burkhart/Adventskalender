import { describe, expect, it } from "vitest"
import { GENERIC_ERROR, authErrorMessage } from "./errors"
import {
  NEW_PASSWORD_PATH,
  confirmTarget,
  parseEmailOtpType,
  safeNextPath,
} from "./redirect"

describe("safeNextPath", () => {
  it.each(["/", "/profile", "/2026/3", "/passwort-neu?x=1"])(
    "keeps %s",
    (path) => expect(safeNextPath(path)).toBe(path),
  )

  it.each([
    null,
    undefined,
    "",
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "/\nfoo",
  ])("rejects %s", (path) => expect(safeNextPath(path)).toBe("/"))
})

describe("parseEmailOtpType", () => {
  it("accepts e-mail types", () => {
    expect(parseEmailOtpType("recovery")).toBe("recovery")
    expect(parseEmailOtpType("email")).toBe("email")
  })

  it("rejects anything else", () => {
    expect(parseEmailOtpType("sms")).toBeNull()
    expect(parseEmailOtpType(null)).toBeNull()
  })
})

describe("confirmTarget", () => {
  it("always sends recovery links to the new-password page", () => {
    expect(confirmTarget("recovery", "/login")).toBe(NEW_PASSWORD_PATH)
    expect(confirmTarget("recovery", null)).toBe(NEW_PASSWORD_PATH)
  })

  it("follows a safe next for other types", () => {
    expect(confirmTarget("email", "/rangliste")).toBe("/rangliste")
    expect(confirmTarget("email", "https://evil.example")).toBe("/")
    expect(confirmTarget(null, "/passwort-neu")).toBe("/passwort-neu")
  })
})

describe("authErrorMessage", () => {
  it("translates known codes", () => {
    expect(authErrorMessage({ code: "invalid_credentials" })).toBe(
      "E-Mail-Adresse oder Passwort ist falsch.",
    )
  })

  it("falls back to a generic message", () => {
    expect(authErrorMessage({ code: "something_new" })).toBe(GENERIC_ERROR)
    expect(authErrorMessage(null)).toBe(GENERIC_ERROR)
  })
})
