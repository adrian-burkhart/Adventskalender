import clsx from "clsx"
import { memo } from "react"
import { ButtonLink } from "@/components/button"
import type { DoorReview } from "@/lib/door-api"
import { normalizeOption } from "@/lib/doors"
import { SolutionPicture } from "./result"

/**
 * An answered door, opened again: the question with every option, the
 * right one and the player's own marked. Only to look at.
 */
const Review = memo(
  ({ review, doorNumber }: { review: DoorReview; doorNumber: number }) => {
    const right = normalizeOption(review.correctAnswer)
    const mine = review.selected ? normalizeOption(review.selected) : null
    const oldDoor = review.isCorrect === null

    return (
      <div className="flex w-full max-w-xl flex-col items-center gap-5 text-center">
        <p className="text-base text-candle/80">
          Türchen {doorNumber} · schon beantwortet
        </p>
        <h1 className="card w-full px-5 py-4 font-body text-xl font-semibold not-italic">
          {review.question}
        </h1>
        <ul className="flex w-full flex-col gap-2.5 text-left">
          {review.options.map((option) => {
            const key = normalizeOption(option)
            const isRight = key === right
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
                      : "border-gold/20 bg-black/25 text-candle/70",
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
        <p className="text-base">
          {oldDoor
            ? "Deine Antwort von damals ist nicht gespeichert."
            : mine === null
              ? "Du hattest keine Antwort gewählt."
              : review.points
                ? `Dafür hast du ${review.points} Punkte bekommen.`
                : "Dafür gab es leider keine Punkte."}
        </p>
        <SolutionPicture image={review.image} />
        <ButtonLink href="/">Zurück zum Kalender</ButtonLink>
      </div>
    )
  },
)

export default Review
