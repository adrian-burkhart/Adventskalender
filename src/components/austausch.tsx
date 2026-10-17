"use client"

import Image from "next/image"
import { memo, useState, useTransition, type FormEvent } from "react"
import { postComment } from "@/app/austausch/actions"
import Button, { ButtonLink } from "@/components/button"
import Layout from "@/components/layout"
import { COMMENT_MAX_LENGTH } from "@/lib/exchange"
import type { ExchangeComment, ExchangeData } from "@/lib/exchange-data"
import { doorPath } from "@/lib/routes"
import { ERROR_TEXT } from "@/lib/texts"
import welcomeImage from "../../public/images/welcome.webp"

/** "Türchen 20", "Türchen 20 und 22", "Türchen 18, 20 und 22". */
function doorList(doors: number[]): string {
  if (doors.length === 1) return `Türchen ${doors[0]}`
  return `Türchen ${doors.slice(0, -1).join(", ")} und ${doors.at(-1)}`
}

/** The page to talk about the calendar, around the campfire. */
const Austausch = memo(({ data }: { data: ExchangeData | null }) => {
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
        {!data ? (
          <p role="alert" className="text-center text-lg">
            {ERROR_TEXT}
          </p>
        ) : data.allowed ? (
          <>
            <p className="text-center text-lg">
              Setzt euch ans Lagerfeuer und erzählt, wie euch die Türchen
              gefallen haben!
            </p>
            <WriteBox />
            <Comments comments={data.comments} />
          </>
        ) : (
          <Closed year={data.year} missing={data.missing} />
        )}
      </div>
    </Layout>
  )
})

/** Why the door is shut, and the way to the first missing door. */
function Closed({ year, missing }: { year: number; missing: number[] }) {
  return (
    <div className="flex flex-col items-center gap-4 card px-5 py-5 text-center">
      <p className="text-xl">
        🔒 Bitte beantworte erst alle bisherigen Türchen, um den Austausch zu
        öffnen.
      </p>
      <p className="text-lg text-candle/85">
        {missing.length <= 5
          ? `Dir ${missing.length === 1 ? "fehlt" : "fehlen"} noch ${doorList(missing)}.`
          : `Dir fehlen noch ${missing.length} Türchen.`}
      </p>
      <ButtonLink href={doorPath(year, missing[0])}>
        Zu Türchen {missing[0]}
      </ButtonLink>
    </div>
  )
}

function WriteBox() {
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

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
        Schreib etwas für alle:
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

/** All comments in one column, newest first. */
function Comments({ comments }: { comments: ExchangeComment[] }) {
  if (comments.length === 0) {
    return (
      <p className="card px-5 py-4 text-center text-lg text-candle/85">
        Hier ist es noch ruhig. Schreib doch den ersten Kommentar!
      </p>
    )
  }
  return (
    <ul className="flex flex-col card px-5 py-2">
      {comments.map((c) => (
        <li key={c.id} className="border-b border-gold/20 py-4 last:border-b-0">
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
  )
}

export default Austausch
