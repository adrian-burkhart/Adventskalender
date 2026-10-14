import { env } from "./env"

// Reads the e-mails that arrive at the Resend receiving address.
// API: https://resend.com/docs/api-reference/emails/list-received-emails

export interface Mail {
  id: string
  from: string
  to: string[]
  subject: string
  created_at: string
  html: string | null
  text: string | null
}

async function resend<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.resend.com${path}`, {
    headers: { authorization: `Bearer ${env.resendApiKey()}` },
  })
  if (!response.ok) {
    throw new Error(
      `Resend ${path}: ${response.status} ${await response.text()}`,
    )
  }
  return (await response.json()) as T
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Waits for the first e-mail to `to` that arrived after `since`. */
export async function waitForMail(
  to: string,
  since: Date,
  timeoutMs = 120_000,
): Promise<Mail> {
  const deadline = Date.now() + timeoutMs
  const address = to.toLowerCase()
  while (Date.now() < deadline) {
    const { data } = await resend<{ data: Omit<Mail, "html" | "text">[] }>(
      "/emails/receiving?limit=50",
    )
    const match = data
      .filter(
        (mail) =>
          mail.to.some((t) => t.toLowerCase() === address) &&
          // A few seconds of slack for clocks that disagree.
          Date.parse(mail.created_at) >= since.getTime() - 5_000,
      )
      .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))[0]
    if (match) return resend<Mail>(`/emails/receiving/${match.id}`)
    await sleep(3_000)
  }
  throw new Error(`No e-mail to ${to} within ${timeoutMs / 1000} s`)
}

/** The /auth/confirm link in an e-mail. */
export function confirmLink(mail: Mail): URL {
  const href = mail.html?.match(/href="([^"]*\/auth\/confirm[^"]*)"/)?.[1]
  if (!href) throw new Error(`No confirm link in "${mail.subject}"`)
  return new URL(href.replaceAll("&amp;", "&"))
}

/** The one-time code in an e-mail (Supabase setting: 6 to 10 digits). */
export function loginCode(mail: Mail): string {
  const body = mail.text || mail.html?.replace(/<[^>]+>/g, " ") || ""
  const code = body.match(/\b(\d{6,10})\b/)?.[1]
  if (!code) throw new Error(`No code in "${mail.subject}"`)
  return code
}
