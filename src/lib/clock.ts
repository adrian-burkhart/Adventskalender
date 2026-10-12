import "server-only"

/**
 * The date that decides which doors are open. Previews and local runs can
 * set TEST_NOW (e.g. 2025-12-10T09:00:00+01:00) to test doors outside
 * December; production always uses the real date. The question timer
 * always uses the real time.
 */
export function calendarNow(): Date {
  const fake = process.env.TEST_NOW
  if (fake && process.env.VERCEL_ENV !== "production") {
    const date = new Date(fake)
    if (!Number.isNaN(date.getTime())) return date
  }
  return new Date()
}
