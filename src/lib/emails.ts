import "server-only"

const FROM = "Adventskalender <wichtel@adventskalender-haas.de>"

export interface Email {
  to: string
  subject: string
  html: string
  text: string
}

/** Resend takes up to 100 e-mails per request. */
export const BATCH_SIZE = 100

/**
 * Sends e-mails through Resend in one request, all or nothing. Throws when
 * they didn't go out.
 */
export async function sendEmails(emails: Email[]): Promise<void> {
  if (emails.length === 0) return
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error("RESEND_API_KEY is not set")
  const response = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emails.map((email) => ({ from: FROM, ...email }))),
  })
  if (!response.ok) {
    throw new Error(`Resend: ${response.status} ${await response.text()}`)
  }
}

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  )

/**
 * A cozy letter: dark green, golden heading, large text for older eyes,
 * one big button back to the calendar.
 */
function letter({
  heading,
  paragraphs,
  button,
  url,
}: {
  heading: string
  paragraphs: string[]
  button: string
  url: string
}): string {
  const body = paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 18px;font-size:20px;line-height:1.5;color:#fef3c7">${p}</p>`,
    )
    .join("")
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0b2a1a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b2a1a">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#123d27;border:2px solid #d4a73a;border-radius:20px">
<tr><td style="padding:32px 28px;font-family:Georgia,'Times New Roman',serif;text-align:center">
<p style="margin:0 0 8px;font-size:30px">🎄</p>
<h1 style="margin:0 0 24px;font-size:30px;line-height:1.25;color:#fcd34d;font-weight:600">${heading}</h1>
${body}
<p style="margin:28px 0 8px"><a href="${url}" style="display:inline-block;background:#e9b949;color:#14301f;text-decoration:none;font-size:20px;font-weight:bold;padding:14px 28px;border-radius:999px;border:3px solid #1f5a3a">${button}</a></p>
</td></tr></table>
<p style="margin:20px 0 0;font-family:Georgia,serif;font-size:14px;color:#a7b8a0">Du bekommst diese E-Mail, weil du beim Familien-Adventskalender mitspielst.</p>
</td></tr></table>
</body></html>`
}

function plain(heading: string, paragraphs: string[], url: string): string {
  return [
    heading,
    "",
    ...paragraphs.map((p) => p.replace(/<[^>]+>/g, "")),
    "",
    url,
  ].join("\n")
}

/** The one reminder per season, after five missed doors. */
export function reminderEmail({
  to,
  name,
  url,
}: {
  to: string
  name: string
  url: string
}): Email {
  const heading = "Der Wichtel vermisst dich!"
  const paragraphs = [
    `Hallo ${escape(name)},`,
    "im Adventskalender warten ein paar Türchen auf dich. Du kannst sie bis zum 31. Dezember nachholen, die Punkte zählen genauso.",
    "Wir freuen uns, wenn du wieder vorbeischaust!",
  ]
  return {
    to,
    subject: "Im Adventskalender warten Türchen auf dich",
    html: letter({ heading, paragraphs, button: "Zum Kalender", url }),
    text: plain(heading, paragraphs, url),
  }
}

/** On 1 January: who won, and how this player did. */
export function winnerEmail({
  to,
  name,
  year,
  winners,
  winnerScore,
  score,
  place,
  url,
}: {
  to: string
  name: string
  year: number
  winners: string[]
  winnerScore: number
  score: number
  place: number
  url: string
}): Email {
  const names = winners.map(escape)
  const together =
    names.length > 1
      ? `${names.slice(0, -1).join(", ")} und ${names.at(-1)}`
      : names[0]
  const isWinner = place === 1
  const heading = isWinner
    ? "Du hast gewonnen!"
    : `${together} ${names.length > 1 ? "haben" : "hat"} gewonnen!`
  const paragraphs = [
    `Hallo ${escape(name)},`,
    isWinner
      ? names.length > 1
        ? `herzlichen Glückwunsch! Du teilst dir den Sieg im Adventskalender ${year} mit ${names.filter((n) => n !== escape(name)).join(" und ")}, mit <strong>${winnerScore} Punkten</strong>.`
        : `herzlichen Glückwunsch! Du hast den Adventskalender ${year} gewonnen, mit <strong>${winnerScore} Punkten</strong>.`
      : `der Adventskalender ${year} ist vorbei. Gewonnen ${names.length > 1 ? "haben" : "hat"} <strong>${together}</strong> mit ${winnerScore} Punkten. Herzlichen Glückwunsch!`,
    isWinner
      ? ""
      : `Du hast <strong>${score} Punkte</strong> gesammelt und bist auf Platz ${place} gelandet.`,
    "Danke, dass du dabei warst. Wir wünschen dir ein frohes neues Jahr und freuen uns auf den nächsten Advent!",
  ].filter(Boolean)
  return {
    to,
    subject: isWinner
      ? `Du hast den Adventskalender ${year} gewonnen!`
      : `Der Adventskalender ${year}: ${together} ${names.length > 1 ? "haben" : "hat"} gewonnen`,
    html: letter({ heading, paragraphs, button: "Zur Rangliste", url }),
    text: plain(heading, paragraphs, url),
  }
}
