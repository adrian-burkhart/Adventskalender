function required(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set (see e2e/README.md)`)
  return value
}

export const env = {
  /** The Resend-provided receiving domain, e.g. "abc123.resend.app". */
  mailDomain: () => required("E2E_MAIL_DOMAIN"),
  /** Resend API key that may read received e-mails. */
  resendApiKey: () => required("E2E_RESEND_API_KEY"),
  /** Sanity read token, to look up the right answer of a door. */
  sanityToken: () => required("E2E_SANITY_TOKEN"),
  /** The year the preview's calendar shows (TEST_NOW). */
  year: () => process.env.E2E_YEAR ?? "2025",
  /** A door that is still locked at TEST_NOW. */
  lockedDoor: () => Number(process.env.E2E_LOCKED_DOOR ?? "24"),
}
