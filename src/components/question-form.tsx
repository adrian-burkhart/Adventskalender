"use client"

import { memo, useCallback, useEffect, useRef, useState } from "react"
import AudioPlayer from "./audio-player"
import Button, { ButtonLink } from "./button"
import Countdown from "./door/countdown"
import Anticipation from "./door/anticipation"
import ResultView from "./door/result"
import Review from "./door/review"
import ReadyButton from "./ready-button"
import { apiFetch } from "@/lib/api-client"
import type { DoorResponse, DoorReview } from "@/lib/door-api"
import { ERROR_TEXT } from "@/lib/texts"
import { useScoresContext } from "@/lib/context"
import { FeatureFlag, useFeatureFlag } from "@/lib/feature-flags"
import Loading from "./loading"

type Result = Extract<DoorResponse, { status: "result" }>

type Step =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "missing" }
  | { kind: "locked" }
  | { kind: "answered"; review: DoorReview }
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
    case "answered":
      return { kind: "answered", review: response.review }
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
      <div className="mt-4 flex flex-col items-center justify-between gap-6">
        {introAudio ? (
          <AudioPlayer url={introAudio} />
        ) : (
          <div>Ups, hier fehlt noch was.</div>
        )}
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
      // Phones: a small countdown above the question. Wider screens: the
      // question on the left, the countdown on the right. Either way all
      // of it fits without scrolling.
      <div className="grid w-full max-w-4xl items-start gap-4 md:grid-cols-[minmax(0,1fr)_19rem] md:gap-10">
        <div className="flex flex-col items-center gap-2 md:order-2 md:pt-4">
          {step.questionAudio && (
            <AudioPlayer smallButton autoPlay url={step.questionAudio} />
          )}
          <Countdown
            deadline={step.deadline}
            isSubmitted={isSubmitted}
            onComplete={() => onSubmit(selectedOption)}
          />
        </div>
        <div className="flex w-full flex-col items-center gap-4 md:order-1">
          <h1 className="w-full card px-5 py-4 text-center font-body text-xl font-semibold not-italic">
            {step.question}
          </h1>
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-center gap-4"
          >
            <fieldset className="flex w-full flex-col gap-2.5">
              <legend className="sr-only">Antwortmöglichkeiten</legend>
              {step.options.map((option, i) => (
                <label
                  key={i}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 border-gold/40 bg-black/30 px-4 py-2 text-base transition hover:border-gold hover:bg-black/40 has-checked:border-gold has-checked:bg-gold has-checked:text-pine-950 has-focus-visible:ring-4 has-focus-visible:ring-gold/60"
                >
                  <input
                    value={option}
                    name="questionOption"
                    type="radio"
                    disabled={isSubmitted}
                    onChange={() => setSelectedOption(option)}
                    className="h-5 w-5 shrink-0 accent-berry"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>
            <Button disabled={!selectedOption || isSubmitted} type="submit">
              Bestätigen
            </Button>
          </form>
        </div>
      </div>
    )
  },
)

/**
 * The outro audio starts with a jingle; while it plays, something builds up
 * to the result, which shows when the jingle ends.
 */
const OutroStep = memo(
  ({ result, doorNumber }: { result: Result; doorNumber: number }) => {
    const [started, setStarted] = useState(false)
    const [revealed, setRevealed] = useState(false)

    // Without outro audio, or when the browser holds it back, start anyway.
    useEffect(() => {
      const timer = setTimeout(
        () => setStarted(true),
        result.outroAudio ? 1500 : 0,
      )
      return () => clearTimeout(timer)
    }, [result.outroAudio])

    return (
      <div className="flex w-full flex-col items-center gap-6">
        {result.outroAudio && (
          <AudioPlayer
            smallButton
            autoPlay
            url={result.outroAudio}
            onPlaying={() => setStarted(true)}
          />
        )}
        {revealed ? (
          <ResultView result={result} doorNumber={doorNumber} />
        ) : (
          <Anticipation started={started} onDone={() => setRevealed(true)} />
        )}
      </div>
    )
  },
)

function Message({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <p className="card px-6 py-4 text-lg">{children}</p>
      <ButtonLink href="/">Zurück zum Kalender</ButtonLink>
    </div>
  )
}

/**
 * Steps the server can render with the page. A running question isn't one:
 * its countdown depends on this device's clock.
 */
function initialStep(initial: DoorResponse | null): Step {
  if (!initial || initial.status === "question" || initial.status === "result")
    return { kind: "loading" }
  return toStep(initial)
}

const QuestionForm = memo(
  ({
    year,
    doorNumber,
    initial,
  }: {
    year: string
    doorNumber: number
    initial: DoorResponse | null
  }) => {
    const base = `/api/doors/${year}/${doorNumber}`
    const [step, setStep] = useState<Step>(() => initialStep(initial))
    const [isSubmitted, setIsSubmitted] = useState(false)
    const submitted = useRef(false)
    const testMode = useFeatureFlag(FeatureFlag.ENABLE_TEST_MODE)
    const { refreshScores } = useScoresContext()
    const needsLoad = initialStep(initial).kind === "loading"

    const load = useCallback(
      (path: string, init?: RequestInit) =>
        apiFetch<DoorResponse>(path, init)
          .then((response) => {
            setStep(toStep(response))
            // The new points show up in the header right away.
            if (response.status === "result") refreshScores()
          })
          .catch((error) => {
            console.error(error)
            setStep({ kind: "error" })
          }),
      [refreshScores],
    )

    // Test mode (admins) asks the API, which knows about it; so does a
    // question that is already running.
    useEffect(() => {
      if (needsLoad || testMode) load(base)
    }, [base, load, needsLoad, testMode])

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
        return <Loading />
      case "error":
        return <div>{ERROR_TEXT}</div>
      case "missing":
        return <div>Frage fehlt noch. Sorry ;(</div>
      case "locked":
        return <Message>Diese Tür ist gerade verschlossen.</Message>
      case "answered":
        return (
          <Review review={step.review} year={year} doorNumber={doorNumber} />
        )
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
        return <OutroStep result={step} doorNumber={doorNumber} />
      case "intro":
      default:
        return <IntroStep introAudio={step.introAudio} onReady={start} />
    }
  },
)

export default QuestionForm
