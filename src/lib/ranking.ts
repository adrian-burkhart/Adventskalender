/**
 * Place for a score: one more than the number of better scores, so players
 * with the same points share a place (1, 2, 2, 4).
 */
export function rankOf(score: number, entries: { score: number }[]): number {
  return entries.filter((entry) => entry.score > score).length + 1
}

/** Places for a list ranked best first. */
export function ranks(entries: { score: number }[]): number[] {
  return entries.map((entry) => rankOf(entry.score, entries))
}
