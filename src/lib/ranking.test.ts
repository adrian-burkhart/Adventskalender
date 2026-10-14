import { describe, expect, it } from "vitest"
import { rankOf, ranks } from "./ranking"

describe("ranking", () => {
  it("lets players with the same points share a place", () => {
    const scores = [50, 30, 30, 10, 0, 0].map((score) => ({ score }))
    expect(ranks(scores)).toEqual([1, 2, 2, 4, 5, 5])
  })

  it("puts a score into an existing list", () => {
    const scores = [50, 30, 10].map((score) => ({ score }))
    expect(rankOf(30, scores)).toBe(2)
    expect(rankOf(60, scores)).toBe(1)
    expect(rankOf(0, scores)).toBe(4)
  })
})
