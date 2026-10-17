"use client"

import clsx from "clsx"
import { memo, useState } from "react"
import AudioPlayer from "@/components/audio-player"
import Button, { ButtonLink } from "@/components/button"
import type { DoorReview } from "@/lib/door-api"
import { normalizeOption } from "@/lib/doors"
import { SolutionPicture } from "./result"

/**
 * A door opened again, only to look at and listen to: an answered door
 * with the right answer and the player's own marked, or a door of a past
 * season, whose answer waits behind a button so everyone can guess along.
 */
const Review = memo(
  ({
    review,
    year,
    doorNumber,
  }: {
    review: DoorReview
    year: string
    doorNumber: number
  }) => {
    const [revealed, setRevealed] = useState(review.played)
    const right = normalizeOption(review.correctAnswer)
    const mine = review.selected ? normalizeOption(review.selected) : null
    const oldDoor = review.played && review.isCorrect === null

    return (
      <div className="flex w-full max-w-xl flex-col items-center gap-5 text-center">
        <p className="text-base text-candle/80">
          {review.played
            ? `Türchen ${doorNumber} · schon beantwortet`
            : `Türchen ${doorNumber} aus dem Jahr ${year}`}
        </p>
        <Listen
          audio={[
            ["Ansage", review.audio.intro],
            ["Frage", review.audio.question],
            ...(revealed
              ? [["Auflösung", review.audio.outro] as [string, string | null]]
              : []),
          ]}
        />
        <h1 className="w-full card px-5 py-4 font-body text-xl font-semibold not-italic">
          {review.question}
        </h1>
        <ul className="flex w-full flex-col gap-2.5 text-left">
          {review.options.map((option) => {
            const key = normalizeOption(option)
            const isRight = revealed && key === right
            const isMine = key === mine
            return (
              <li
                key={option}
                className={clsx(
                  "flex min-h-[3rem] items-center justify-between gap-3 rounded-2xl border-2 px-4 py-2 text-base",
                  isRight
                    ? "border-gold bg-gold/90 font-semibold text-pine-950"
                    : isMine
                      ? "border-berry-light/70 bg-berry/25"
                      : revealed
                        ? "border-gold/20 bg-black/25 text-candle/70"
                        : "border-gold/40 bg-black/30",
                )}
              >
                <span>{option}</span>
                <span className="shrink-0 text-sm">
                  {isRight && isMine
                    ? "Deine Antwort, richtig"
                    : isRight
                      ? "Richtige Antwort"
                      : isMine
                        ? "Deine Antwort"
                        : null}
                </span>
              </li>
            )
          })}
        </ul>
        {!revealed && (
          <Button onClick={() => setRevealed(true)}>Auflösung zeigen</Button>
        )}
        {review.played && (
          <p className="text-base">
            {oldDoor
              ? "Deine Antwort von damals ist nicht gespeichert."
              : mine === null
                ? "Du hattest keine Antwort gewählt."
                : review.points
                  ? `Dafür hast du ${review.points} Punkte bekommen.`
                  : "Dafür gab es leider keine Punkte."}
          </p>
        )}
        {revealed && <SolutionPicture image={review.image} />}
        <ButtonLink href="/" quiet={!revealed}>
          Zurück zum Kalender
        </ButtonLink>
      </div>
    )
  },
)

/** The recordings of the door, each with its play button and a label. */
function Listen({ audio }: { audio: [string, string | null][] }) {
  const present = audio.filter(
    (entry): entry is [string, string] => entry[1] !== null,
  )
  if (present.length === 0) return null
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
      {present.map(([label, url]) => (
        <div key={label} className="flex items-center gap-2">
          <AudioPlayer smallButton url={url} />
          <span className="text-base">{label}</span>
        </div>
      ))}
    </div>
  )
}

export default Review
