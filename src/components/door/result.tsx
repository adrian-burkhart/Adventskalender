"use client"

import clsx from "clsx"
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
        <h2
          className={clsx(
            // The farewell on door 24 is a whole sentence: a little smaller.
            !result.isCorrect && doorNumber === 24 ? "text-2xl" : "text-4xl",
          )}
        >
          <Headline result={result} doorNumber={doorNumber} />
        </h2>
        <div className="flex w-full flex-col gap-3 card px-5 py-5 text-lg">
          <Explanation result={result} />
          <Standing result={result} />
        </div>
        <SolutionPicture image={result.image} />
        <Actions exchangeOpen={result.exchangeOpen} />
      </div>
    )
  },
)

// --- Shared texts --------------------------------------------------------------

function Headline({
  result,
  doorNumber,
}: {
  result: ResultData
  doorNumber: number
}) {
  if (result.isCorrect) return <>Richtig!</>
  // After door 24 there is no tomorrow to try again.
  return doorNumber === 24 ? (
    <>
      Wir würden uns freuen, wenn du nächstes Jahr wieder dabei bist. Frohe
      Weihnachten!
    </>
  ) : (
    <>Versuche es morgen nochmal</>
  )
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

/** Points and place in the Rangliste. */
function Standing({ result }: { result: ResultData }) {
  return (
    <div className="flex flex-col gap-1">
      {result.score !== null && (
        <p>
          Deine Punktzahl ist jetzt: <strong>{result.score}</strong>
        </p>
      )}
      {result.rank !== null && (
        <p>
          {result.rank === 1
            ? "Du stehst auf Platz 1!"
            : `Du bist jetzt auf Platz ${result.rank}.`}
        </p>
      )}
    </div>
  )
}

/** The picture from the CMS that goes with the answer. */
export function SolutionPicture({ image }: { image: string | null }) {
  if (!image) return null
  return (
    <div className="rotate-1 rounded-xs bg-white p-2 pb-6 shadow-lg">
      <Image
        width="0"
        height="0"
        sizes="(min-width: 640px) 24rem, 90vw"
        className="h-auto max-h-80 w-auto max-w-full"
        src={image}
        alt=""
      />
    </div>
  )
}

/** The Austausch only shows up once every open door is answered. */
function Actions({ exchangeOpen }: { exchangeOpen: boolean }) {
  return (
    <div className="flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
      <ButtonLink href="/">Zurück zum Kalender</ButtonLink>
      <ButtonLink href="/rangliste" quiet>
        Zur Rangliste
      </ButtonLink>
      {exchangeOpen && (
        <ButtonLink href="/austausch" quiet>
          Zum Austausch
        </ButtonLink>
      )}
    </div>
  )
}

export default Result
