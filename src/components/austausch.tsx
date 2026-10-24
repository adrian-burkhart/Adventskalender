"use client"

import clsx from "clsx"
import Image from "next/image"
import { memo, useState, useTransition, type FormEvent } from "react"
import {
  deleteComment,
  editComment,
  postComment,
} from "@/app/austausch/actions"
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

const TEXTAREA =
  "w-full resize-y rounded-[12px] border border-gold/50 bg-black/30 px-4 py-3 text-lg text-white focus:border-gold focus:ring-2 focus:ring-gold/40 focus:outline-hidden"

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
        <Welcome />
        {!data ? (
          <p role="alert" className="text-center text-lg">
            {ERROR_TEXT}
          </p>
        ) : data.allowed ? (
          <>
            <Comments comments={data.comments} />
            <WriteBox />
          </>
        ) : (
          <Closed year={data.year} missing={data.missing} />
        )}
      </div>
    </Layout>
  )
})

function Welcome() {
  return (
    <div className="flex flex-col gap-3 text-center text-lg">
      <p className="font-display text-2xl text-candle">
        Willkommen im Austausch!
      </p>
      <p>
        Sobald du alle bisherigen Türchen beantwortet hast, kannst du dich hier
        mit den anderen Mitspielern austauschen.
      </p>
      <p>
        Hier kannst du über die Rätsel sprechen, deine Gedanken und Ideen teilen
        oder einfach etwas zu den Türchen schreiben. Natürlich ist auch Platz
        für alles Weitere, was du gerne mit der Gruppe teilen möchtest.
      </p>
      <p>
        Wir sind eine große Runde voller lieber Menschen. Ob du viel schreibst
        oder lieber still mitliest. Du bist herzlich willkommen und kannst
        nichts falsch machen.
      </p>
    </div>
  )
}

/** Why the door is shut, and the way to the first missing door. */
function Closed({ year, missing }: { year: number; missing: number[] }) {
  return (
    <div className="flex flex-col items-center gap-4 card px-5 py-5 text-center">
      <p className="text-xl">
        Bitte beantworte erst alle bisherigen Türchen, um den Austausch zu
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
        className={TEXTAREA}
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

/** All comments in one column, oldest first, so the newest sits above the form. */
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
        <CommentItem key={c.id} comment={c} />
      ))}
    </ul>
  )
}

function CommentItem({ comment: c }: { comment: ExchangeComment }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(c.body)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const act = (action: () => Promise<string | null>, then?: () => void) => {
    setError(null)
    startTransition(async () => {
      const failure = await action()
      if (failure) setError(failure)
      else then?.()
    })
  }

  const remove = () => {
    const question = c.mine
      ? "Möchtest du deinen Kommentar wirklich löschen?"
      : `Möchtest du den Kommentar von ${c.name} wirklich löschen?`
    if (window.confirm(question)) act(() => deleteComment(c.id))
  }

  const save = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    act(
      () => editComment(c.id, text),
      () => setEditing(false),
    )
  }

  return (
    <li
      className={clsx(
        "border-b border-gold/20 py-4 last:border-b-0",
        pending && "opacity-60",
      )}
    >
      <p className="flex flex-wrap items-baseline gap-x-2">
        <strong className="text-lg text-gold-light">
          {c.mine ? `${c.name} (du)` : c.name}
        </strong>
        <span className="text-sm text-candle/70">
          {c.time}
          {c.edited && " · bearbeitet"}
        </span>
      </p>

      {editing ? (
        <form onSubmit={save} className="mt-2 flex flex-col gap-3">
          <label htmlFor={`edit-${c.id}`} className="sr-only">
            Kommentar bearbeiten
          </label>
          <textarea
            id={`edit-${c.id}`}
            rows={3}
            maxLength={COMMENT_MAX_LENGTH}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={TEXTAREA}
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={pending || !text.trim()}>
              Speichern
            </Button>
            <Button
              type="button"
              quiet
              onClick={() => {
                setEditing(false)
                setText(c.body)
              }}
            >
              Abbrechen
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-1 text-lg wrap-break-word whitespace-pre-wrap text-white">
          {c.body}
        </p>
      )}

      {!editing && (c.mine || c.canDelete) && (
        <div className="mt-3 flex gap-4 text-base">
          {c.mine && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-candle/80 underline decoration-gold/50 underline-offset-4 hover:text-candle"
            >
              Bearbeiten
            </button>
          )}
          {c.canDelete && (
            <button
              type="button"
              onClick={remove}
              className="text-[#ff9b9b] underline decoration-[#ff9b9b]/50 underline-offset-4 hover:text-[#ffb8b8]"
            >
              Löschen
            </button>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-[#ff9b9b]">
          {error}
        </p>
      )}
    </li>
  )
}

export default Austausch
