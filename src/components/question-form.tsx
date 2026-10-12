"use client"

import { memo, useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import AudioPlayer from "./audio-player"
import giftGif from "../../public/images/gift.gif"
import solutionImage from "../../public/images/solution.webp"
import shrugImage from "../../public/images/shrug.webp"
import thinkingImage from "../../public/images/thinking.webp"
import Button from "./button"
import Countdown from "./countdown"
import ReadyButton from "./ready-button"
import Image from "next/image"
import { apiFetch } from "@/lib/api-client"
import type { DoorResponse } from "@/lib/door-api"
import { ERROR_TEXT, LOADING_TEXT } from "@/lib/texts"

type Result = Extract<DoorResponse, { status: "result" }>

type Step =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "missing" }
  | { kind: "locked" }
  | { kind: "answered" }
  | { kind: "intro"; introAudio: string | null }
  | {
      kind: "question"
      question: string
      options: string[]
      questionAudio: string | null
      /** Deadline on this device's clock. */
      deadline: number
    }
  | ({ kind: "result" } & Result)

function toStep(response: DoorResponse): Step {
  switch (response.status) {
    case "question": {
      // Use the server's deadline, corrected for this device's clock.
      const offset = Date.parse(response.now) - Date.now()
      return {
        kind: "question",
        question: response.question,
        options: response.options,
        questionAudio: response.questionAudio,
        deadline: Date.parse(response.deadline) - offset,
      }
    }
    case "intro":
      return { kind: "intro", introAudio: response.introAudio }
    case "result":
      return { ...response, kind: "result" }
    default:
      return { kind: response.status }
  }
}

const IntroStep = memo(
  ({
    introAudio,
    onReady,
  }: {
    introAudio: string | null
    onReady: () => void
  }) => {
    return (
      <div className="mt-12 flex flex-col items-center justify-between gap-6">
        {introAudio ? (
          <AudioPlayer url={introAudio} />
        ) : (
          <div>Ups, hier fehlt noch was.</div>
        )}
        <div className="max-w-xs text-center text-sm">
          Sobald du auf „Bereit“ tippst, läuft die Zeit. Bleib dann auf dieser
          Seite: Wenn du den Tab oder die App wechselst, zählt deine Antwort als
          falsch.
        </div>
        <ReadyButton onClick={onReady} />
      </div>
    )
  },
)

const QuestionStep = memo(
  ({
    step,
    isSubmitted,
    onSubmit,
    onLeave,
  }: {
    step: Extract<Step, { kind: "question" }>
    isSubmitted: boolean
    onSubmit: (option: string | null) => void
    onLeave: () => void
  }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null)

    // Switching tabs or apps during the question counts as a wrong answer.
    useEffect(() => {
      const handleVisibility = () => {
        if (document.visibilityState === "hidden") onLeave()
      }
      document.addEventListener("visibilitychange", handleVisibility)
      window.addEventListener("pagehide", onLeave)
      return () => {
        document.removeEventListener("visibilitychange", handleVisibility)
        window.removeEventListener("pagehide", onLeave)
      }
    }, [onLeave])

    const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault()
      onSubmit(selectedOption)
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4">
        {step.questionAudio && (
          <AudioPlayer smallButton autoPlay url={step.questionAudio} />
        )}
        <Countdown
          deadline={step.deadline}
          isSubmitted={isSubmitted}
          onComplete={() => onSubmit(selectedOption)}
        />
        <div className="text-center">{step.question}</div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            {step.options.map((option, i) => (
              <div className="flex gap-2" key={i}>
                <input
                  value={option}
                  id={`option-${i}`}
                  name="questionOption"
                  type="radio"
                  onChange={() => setSelectedOption(option)}
                />
                <label htmlFor={`option-${i}`}>{option}</label>
              </div>
            ))}
          </div>
          <div>
            <Button disabled={!selectedOption || isSubmitted} type="submit">
              Bestätigen
            </Button>
          </div>
        </form>
        <Image src={thinkingImage} width={200} alt="" />
      </div>
    )
  },
)

const OutroStep = memo(({ result }: { result: Result }) => {
  const [hasGiftOpened, setHasGiftOpened] = useState<boolean>(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasGiftOpened(true)
    }, 7000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col gap-10 text-center">
      {result.outroAudio && (
        <AudioPlayer smallButton url={result.outroAudio} autoPlay />
      )}
      {!hasGiftOpened ? (
        <Image src={giftGif} width={400} alt="" />
      ) : (
        <div className="flex flex-col items-center gap-10">
          {result.isCorrect ? (
            <Image src={solutionImage} alt="" />
          ) : (
            <Image src={shrugImage} alt="" />
          )}

          {result.isCorrect ? (
            <div>
              Das war korrekt! Du bekommst dafür {result.reward} Punkte.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {result.leftPage && (
                <div>
                  Du hast während der Frage die Seite verlassen, deshalb zählt
                  die Antwort als falsch.
                </div>
              )}
              <div>Das war leider falsch! Du bekommst dafür keine Punkte.</div>
              <div>Die richtige Antwort lautet: {result.correctAnswer}</div>
            </div>
          )}
          {!!result.image && (
            <div>
              <Image
                width="0"
                height="0"
                sizes="100vw"
                className="h-64 w-auto"
                src={result.image}
                alt=""
              />
            </div>
          )}
          <div>
            {result.score !== null && (
              <div>Deine Punktzahl ist jetzt: {result.score}</div>
            )}
            <Link className="flex items-center justify-center" href="/">
              <Button>Zurück zum Kalender</Button>
            </Link>
            <Link
              className="flex items-center justify-center"
              href="/rangliste"
            >
              <Button>Zur Rangliste</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
})

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div>{children}</div>
      <Link className="flex items-center justify-center" href="/">
        <Button>Zurück zum Kalender</Button>
      </Link>
    </div>
  )
}

const QuestionForm = memo(
  ({ year, doorNumber }: { year: string; doorNumber: number }) => {
    const base = `/api/doors/${year}/${doorNumber}`
    const [step, setStep] = useState<Step>({ kind: "loading" })
    const [isSubmitted, setIsSubmitted] = useState(false)
    const submitted = useRef(false)

    const load = useCallback(
      (path: string, init?: RequestInit) =>
        apiFetch<DoorResponse>(path, init)
          .then((response) => setStep(toStep(response)))
          .catch((error) => {
            console.error(error)
            setStep({ kind: "error" })
          }),
      [],
    )

    useEffect(() => {
      load(base)
    }, [base, load])

    const start = () => {
      setStep({ kind: "loading" })
      submitted.current = false
      setIsSubmitted(false)
      load(`${base}/start`, { method: "POST" })
    }

    const submit = useCallback(
      (option: string | null, leftPage = false) => {
        if (submitted.current) return
        submitted.current = true
        setIsSubmitted(true)
        load(`${base}/answer`, {
          method: "POST",
          body: JSON.stringify({ option, leftPage }),
          // Lets the request finish even when the tab is being hidden.
          keepalive: true,
        })
      },
      [base, load],
    )

    const leave = useCallback(() => submit(null, true), [submit])

    switch (step.kind) {
      case "loading":
        return <div>{LOADING_TEXT}</div>
      case "error":
        return <div>{ERROR_TEXT}</div>
      case "missing":
        return <div>Frage fehlt noch. Sorry ;(</div>
      case "locked":
        return <Message>Diese Tür ist gerade verschlossen.</Message>
      case "answered":
        return <Message>Du hast diese Frage bereits beantwortet.</Message>
      case "question":
        return (
          <QuestionStep
            step={step}
            isSubmitted={isSubmitted}
            onSubmit={submit}
            onLeave={leave}
          />
        )
      case "result":
        return <OutroStep result={step} />
      case "intro":
      default:
        return <IntroStep introAudio={step.introAudio} onReady={start} />
    }
  },
)

export default QuestionForm
