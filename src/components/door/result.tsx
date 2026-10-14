"use client"

import Image from "next/image"
import { memo } from "react"
import { ButtonLink } from "@/components/button"
import type { DoorResponse } from "@/lib/door-api"
import solutionImage from "../../../public/images/solution.webp"
import shrugImage from "../../../public/images/shrug.webp"

export type ResultData = Omit<
  Extract<DoorResponse, { status: "result" }>,
  "status"
>

/**
 * The result after the present opens, around the painted Wichtel: cheering
 * for a right answer, shrugging for a wrong one. A right answer should feel
 * like a small gift; a wrong one like "never mind, see you tomorrow".
 */
const Result = memo(
  ({ result, doorNumber }: { result: ResultData; doorNumber: number }) => {
    return (
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <Image
          src={result.isCorrect ? solutionImage : shrugImage}
          alt=""
          priority
          className="h-auto w-72 animate-rise-in drop-shadow-[0_0_30px_rgb(254_240_138/0.25)] sm:w-80"
        />
        <h2 className="text-4xl">
          <Headline result={result} />
        </h2>
        <div className="card flex w-full flex-col gap-3 px-5 py-5 text-lg">
          <Explanation result={result} />
          <Standing result={result} />
          <p className="text-base text-candle/85">
            An deinem Weihnachtsbaum hängt jetzt etwas Neues.
          </p>
          {!result.isCorrect && <Encouragement doorNumber={doorNumber} />}
        </div>
        <SolutionPicture result={result} />
        <Actions />
      </div>
    )
  },
)

// --- Shared texts --------------------------------------------------------------

function Headline({ result }: { result: ResultData }) {
  return result.isCorrect ? <>Richtig!</> : <>Diesmal leider nicht</>
}

/** What happened, said kindly. */
function Explanation({ result }: { result: ResultData }) {
  if (result.isCorrect) {
    return (
      <p>
        Das war korrekt! Du bekommst dafür{" "}
        <strong>{result.reward} Punkte</strong>.
      </p>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {result.leftPage && (
        <p>
          Du hast während der Frage die Seite verlassen, deshalb zählt die
          Antwort leider nicht.
        </p>
      )}
      {result.timedOut && !result.leftPage && <p>Die Zeit war leider um.</p>}
      <p>
        Die richtige Antwort lautet:{" "}
        <strong className="whitespace-nowrap">{result.correctAnswer}</strong>
      </p>
    </div>
  )
}

function Encouragement({ doorNumber }: { doorNumber: number }) {
  return doorNumber === 24 ? (
    <p>Frohe Weihnachten!</p>
  ) : (
    <p>Morgen wartet schon das nächste Türchen auf dich.</p>
  )
}

/** Points and place in the Rangliste. */
function Standing({ result }: { result: ResultData }) {
  return (
    <div className="flex flex-col gap-1">
      {result.score !== null && (
        <p>
          Deine Punktzahl ist jetzt: <strong>{result.score}</strong>
        </p>
      )}
      {result.rank !== null && result.playerCount !== null && (
        <p>
          {result.rank === 1
            ? `Du stehst auf Platz 1 von ${result.playerCount}!`
            : `Du bist jetzt auf Platz ${result.rank} von ${result.playerCount}.`}
        </p>
      )}
    </div>
  )
}

/** The picture from the CMS that goes with the answer. */
function SolutionPicture({ result }: { result: ResultData }) {
  if (!result.image) return null
  return (
    <div className="rotate-1 rounded-sm bg-white p-2 pb-6 shadow-lg">
      <Image
        width="0"
        height="0"
        sizes="(min-width: 640px) 24rem, 90vw"
        className="h-auto max-h-80 w-auto max-w-full"
        src={result.image}
        alt=""
      />
    </div>
  )
}

function Actions() {
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <ButtonLink href="/">Zurück zum Kalender</ButtonLink>
      <ButtonLink href="/rangliste" quiet>
        Zur Rangliste
      </ButtonLink>
    </div>
  )
}

export default Result
