import type { EmailOtpType } from "@supabase/supabase-js"

export const NEW_PASSWORD_PATH = "/passwort-neu"

/**
 * Only follow redirect targets on this site. Rejects absolute URLs,
 * protocol-relative "//host" and backslash tricks like "/\host".
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/")) return "/"
  if (next.startsWith("//") || next.includes("\\")) return "/"
  if (/[\u0000-\u001f]/.test(next)) return "/"
  return next
}

const EMAIL_OTP_TYPES: readonly EmailOtpType[] = [
  "email",
  "signup",
  "magiclink",
  "recovery",
  "invite",
  "email_change",
]

export function parseEmailOtpType(
  type: string | null | undefined,
): EmailOtpType | null {
  return EMAIL_OTP_TYPES.find((t) => t === type) ?? null
}

/** Where to go after a link from an e-mail was confirmed. */
export function confirmTarget(
  type: EmailOtpType | null,
  next: string | null | undefined,
): string {
  if (type === "recovery") return NEW_PASSWORD_PATH
  return safeNextPath(next)
}
