"use client"

import Image from "next/image"
import Link from "next/link"
import { memo, useState, useTransition, type FormEvent } from "react"
import { postComment } from "@/app/austausch/actions"
import Button, { ButtonLink } from "@/components/button"
import Layout from "@/components/layout"
import { COMMENT_MAX_LENGTH } from "@/lib/exchange"
import type {
  DoorThread,
  ExchangeComment,
  ExchangeData,
} from "@/lib/exchange-data"
import { doorPath } from "@/lib/routes"
import { ERROR_TEXT } from "@/lib/texts"
import welcomeImage from "../../public/images/welcome.webp"

const countText = (count: number) =>
  count === 0
    ? "noch keine Kommentare"
    : count === 1
      ? "1 Kommentar"
      : `${count} Kommentare`

/** The page to talk about the doors, around the campfire. */
const Austausch = memo(({ data }: { data: ExchangeData | null }) => {
  const advent = data?.today != null
  const general = data && (
    <Section
      title="Am Lagerfeuer"
      subtitle={countText(data.general.length)}
      open={!advent}
      comments={data.general}
      empty="Hier ist es noch ruhig. Schreib doch den ersten Kommentar!"
    />
  )

  return (
    <Layout>
      <div className="flex w-full max-w-2xl flex-col gap-6 px-3">
        <h1 className="text-center text-4xl">Austausch</h1>
        <Image
          src={welcomeImage}
          alt=""
          priority
          className="mx-auto w-full max-w-sm rounded-[12px] shadow-xl"
        />
        <p className="text-center text-lg">
          Setzt euch ans Lagerfeuer und erzählt, wie euch die Türchen gefallen
          haben! Damit niemandem etwas verraten wird, siehst du die Kommentare
          zu einem Türchen erst, wenn du es beantwortet hast.
        </p>

        {data ? (
          <>
            <WriteBox data={data} />
            <div className="flex flex-col gap-3">
              {!advent && general}
              {data.doors.map((thread) => (
                <DoorSection
                  key={thread.door}
                  thread={thread}
                  season={data.season}
                  isToday={thread.door === data.today}
                />
              ))}
              {advent && data.general.length > 0 && general}
            </div>
          </>
        ) : (
          <p role="alert" className="text-center text-lg">
            {ERROR_TEXT}
          </p>
        )}
      </div>
    </Layout>
  )
})

/** The form, or why it is closed: today's door isn't answered yet. */
function WriteBox({ data }: { data: ExchangeData }) {
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!data.canWrite && data.today) {
    return (
      <div className="flex flex-col items-center gap-4 card px-5 py-5 text-center">
        <p className="text-lg">
          🔒 Beantworte erst Türchen {data.today}, dann kannst du hier mitlesen
          und mitschreiben.
        </p>
        <ButtonLink href={doorPath(data.season, data.today)}>
          Zu Türchen {data.today}
        </ButtonLink>
      </div>
    )
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!text.trim()) return
    setError(null)
    startTransition(async () => {
      const failure = await postComment(text)
      if (failure) setError(failure)
      else setText("")
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-center gap-3">
      <label htmlFor="comment" className="self-start text-lg">
        {data.today
          ? `Schreib etwas zu Türchen ${data.today}:`
          : "Schreib etwas für alle:"}
      </label>
      <textarea
        id="comment"
        rows={4}
        maxLength={COMMENT_MAX_LENGTH}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Dein Kommentar"
        className="w-full resize-y rounded-[12px] border border-gold/50 bg-black/30 px-4 py-3 text-lg text-white focus:border-gold focus:ring-2 focus:ring-gold/40 focus:outline-hidden"
      />
      {error && (
        <p role="alert" className="text-[#ff9b9b]">
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending || !text.trim()}>
        {pending ? "Wird geschickt …" : "Abschicken"}
      </Button>
    </form>
  )
}

function DoorSection({
  thread,
  season,
  isToday,
}: {
  thread: DoorThread
  season: number
  isToday: boolean
}) {
  const title = `Türchen ${thread.door}${isToday ? " (heute)" : ""}`
  if (!thread.readable) {
    return (
      <Link
        href={doorPath(season, thread.door)}
        className="flex items-center gap-3 card px-5 py-4 text-lg"
      >
        <span aria-hidden>🔒</span>
        <span className="flex flex-col">
          <span className="font-display text-xl text-candle">{title}</span>
          <span className="text-base text-candle/80">
            {countText(thread.count)} · erst nach dem Beantworten sichtbar
          </span>
        </span>
      </Link>
    )
  }
  return (
    <Section
      title={title}
      subtitle={countText(thread.count)}
      open={isToday}
      comments={thread.comments}
      empty="Noch hat niemand etwas geschrieben."
    />
  )
}

/** One fold of the accordion: a title row and its comments, newest first. */
function Section({
  title,
  subtitle,
  open,
  comments,
  empty,
}: {
  title: string
  subtitle: string
  open: boolean
  comments: ExchangeComment[]
  empty: string
}) {
  return (
    <details open={open} className="group card">
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-lg [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden
          className="text-gold transition-transform group-open:rotate-90"
        >
          ▶
        </span>
        <span className="flex flex-col">
          <span className="font-display text-xl text-candle">{title}</span>
          <span className="text-base text-candle/80">{subtitle}</span>
        </span>
      </summary>
      <div className="flex flex-col gap-4 px-5 pb-5">
        {comments.length === 0 ? (
          <p className="text-candle/80">{empty}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {comments.map((c) => (
              <li key={c.id} className="border-t border-gold/20 pt-3">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <strong className="text-lg text-gold-light">
                    {c.mine ? `${c.name} (du)` : c.name}
                  </strong>
                  <span className="text-sm text-candle/70">{c.time}</span>
                </p>
                <p className="mt-1 text-lg wrap-break-word whitespace-pre-wrap text-white">
                  {c.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  )
}

export default Austausch
