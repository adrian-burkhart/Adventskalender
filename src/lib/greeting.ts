const ORDINALS = ["ersten", "zweiten", "dritten", "vierten"]

/**
 * Which Advent Sunday a date is (1 to 4), or null. The fourth Advent is
 * the last Sunday before 25 December; the others are one, two and three
 * weeks earlier (the first can fall in late November).
 */
export function adventSunday(date: Date): number | null {
  if (date.getDay() !== 0) return null
  const year = date.getFullYear()
  const christmas = new Date(year, 11, 25)
  // 25 December itself is never an Advent Sunday.
  const back = christmas.getDay() === 0 ? 7 : christmas.getDay()
  const fourth = new Date(year, 11, 25 - back)
  const weeks = Math.round(
    (fourth.getTime() -
      new Date(year, date.getMonth(), date.getDate()).getTime()) /
      (7 * 24 * 60 * 60 * 1000),
  )
  return weeks >= 0 && weeks <= 3 ? 4 - weeks : null
}

/**
 * The greeting above the calendar, by the player's own clock: Advent
 * Sundays, St Nicholas' Day, New Year's Eve and New Year's Day get their
 * own, otherwise it depends on the time of day.
 */
export function greeting(name: string, date: Date): string {
  const advent = adventSunday(date)
  const nikolaus = date.getMonth() === 11 && date.getDate() === 6
  if (advent && nikolaus) {
    return `Frohen Nikolaus und schönen ${ORDINALS[advent - 1]} Advent, ${name}!`
  }
  if (advent) return `Frohen ${ORDINALS[advent - 1]} Advent, ${name}!`
  if (nikolaus) return `Frohen Nikolaus, ${name}!`
  if (date.getMonth() === 11 && date.getDate() === 31) {
    return `Guten Rutsch, ${name}!`
  }
  if (date.getMonth() === 0 && date.getDate() === 1) {
    return `Frohes Neues, ${name}!`
  }
  const hour = date.getHours()
  if (hour >= 5 && hour < 11) return `Guten Morgen, ${name}!`
  if (hour >= 18 && hour < 23) return `Guten Abend, ${name}!`
  return `Hallo, ${name}!`
}
