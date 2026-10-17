// /api/keepalive checks its own secret (Vercel Cron), not a login.
const PUBLIC_PATHS = ["/login", "/impressum", "/datenschutz", "/api/keepalive"]
// The e-mail routes check the cron secret or an admin login themselves.
const PUBLIC_PREFIXES = ["/auth/", "/api/emails/"]

/** Pages that work without a login. Everything else needs a session. */
export function isPublicPath(pathname: string): boolean {
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname
  return (
    PUBLIC_PATHS.includes(path) ||
    PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix))
  )
}

export function doorPath(year: string | number, doorNumber: number): string {
  return `/${year}/${doorNumber}`
}

/** Validates the /[year]/[door] params. Returns null for anything else. */
export function parseDoorParams(
  year: string,
  door: string,
): { year: string; doorNumber: number } | null {
  if (!/^\d{4}$/.test(year) || !/^\d{1,2}$/.test(door)) return null
  const doorNumber = Number(door)
  if (doorNumber < 1 || doorNumber > 24) return null
  return { year, doorNumber }
}

/**
 * Doors used to live at /{year}{door}, e.g. /202512. Returns the new path
 * for such a URL, or null.
 */
export function legacyDoorRedirect(pathname: string): string | null {
  const match = /^\/(\d{4})(\d{1,2})\/?$/.exec(pathname)
  if (!match) return null
  const parsed = parseDoorParams(match[1], match[2])
  return parsed ? doorPath(parsed.year, parsed.doorNumber) : null
}
