import { Dispatch, SetStateAction, memo, useEffect, useState } from "react"
import Link from "next/link"
import AudioPlayer from "./audio-player"
import {
  Player,
  Question,
  Year,
  useDoors,
  usePlayer,
  useUpdatePlayerScore,
} from "@/lib/hooks"
import Button from "./button"
import { find } from "lodash"
import { dateTimeFromIso } from "@/lib/dateTime"
import Countdown from "./countdown"
import { FeatureFlag, useFeatureFlag } from "@/lib/feature-flags"

const QUESTION_TIME = 60

export enum QuestionFormStep {
  INTRO = "intro",
  QUESTION = "question",
  OUTRO = "outro",
  ALREADY_ANSWERED = "already_answered",
}

const IntroStep = memo(
  ({
    question,
    setFormStep,
  }: {
    question: Question
    setFormStep: Dispatch<SetStateAction<QuestionFormStep>>
  }) => {
    return (
      <div className="mt-24 flex flex-col items-center justify-between gap-6">
        {question.audiofile_intro ? (
          <AudioPlayer url={question.audiofile_intro.file} />
        ) : (
          <div>Ups, hier fehlt noch was.</div>
        )}
        <Button onClick={() => setFormStep(QuestionFormStep.QUESTION)}>
          Bereit?
        </Button>
      </div>
    )
  },
)

const QuestionStep = memo(
  ({
    question,
    isSubmitted,
    handleSubmit,
    setSelectedOption,
    selectedOption,
  }: {
    isSubmitted: boolean
    setSelectedOption: Dispatch<SetStateAction<string | null>>
    handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void
    question: Question
    selectedOption: string | null
  }) => {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        {question.audiofile_question && (
          <AudioPlayer
            smallButton
            autoPlay
            url={question.audiofile_question?.file}
          />
        )}
        <Countdown
          time={QUESTION_TIME}
          isSubmitted={isSubmitted}
          onComplete={() => handleSubmit()}
        />
        <div>{question.question}</div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col">
            {question.answer_options.map((option, i) => (
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
            <Button disabled={!selectedOption} type="submit">
              Bestätigen
            </Button>
          </div>
        </form>

        {/* {question.image && (
          <Image
            src={`${question.image}?w=500`}
            alt="Bild für die Frage"
            width={500}
            height={500}
          />
        )} */}
      </div>
    )
  },
)

const OutroStep = memo(
  ({
    question,
    selectedYear,
    isCorrect,
  }: {
    selectedYear: Year
    question: Question
    isCorrect: boolean
  }) => {
    const { player } = usePlayer()

    const currentScore = selectedYear
      ? player?.scores.find((score) =>
          dateTimeFromIso(score.year).hasSame(
            dateTimeFromIso(selectedYear.year),
            "year",
          ),
        )
      : null
    return (
      <div className="flex flex-col gap-10">
        {question.audiofile_outro && (
          <AudioPlayer
            smallButton
            url={question.audiofile_outro?.file}
            autoPlay
          />
        )}
        {isCorrect ? (
          <div>Das war korrekt! Du bekommst dafür 3 Punkte.</div>
        ) : (
          <div className="flex flex-col gap-2">
            <div>Das war leider falsch! Du bekommst dafür keine Punkte.</div>
            <div>Die richtige Antwort wäre gewesen: {question.answer}</div>
          </div>
        )}
        <div>
          {currentScore && (
            <div>Deine Punktzahl ist jetzt: {currentScore.score}</div>
          )}
          <Link className="flex items-center justify-center" href={"./"}>
            <Button>Zurück zum Kalendar</Button>
          </Link>
          <Link
            className="flex items-center justify-center"
            href={"./rangliste"}
          >
            <Button>Zur Rangliste</Button>
          </Link>
        </div>
      </div>
    )
  },
)

const QuestionForm = memo(
  ({
    question,
    player,
    selectedYear,
    doorNumber,
  }: {
    player: Player
    doorNumber: number
    question: Question
    selectedYear: Year
  }) => {
    const storageKey = `currentFormStep-door-${doorNumber}-year-${selectedYear}`
    const enabledTestMode = useFeatureFlag(FeatureFlag.ENABLE_TEST_MODE)

    const hasQuestionBeenAnswered = () => {
      return find(
        player?.doors_opened,
        (d) =>
          selectedYear &&
          dateTimeFromIso(d.year).hasSame(
            dateTimeFromIso(selectedYear.year),
            "year",
          ) &&
          d.door_number === doorNumber &&
          d.isAnswered,
      )
    }

    const initialFormStep =
      hasQuestionBeenAnswered() && !enabledTestMode
        ? QuestionFormStep.ALREADY_ANSWERED
        : (localStorage.getItem(storageKey) as QuestionFormStep) ||
          QuestionFormStep.INTRO

    const [formStep, setFormStep] = useState<QuestionFormStep>(initialFormStep)
    const [isCorrect, setIsCorrect] = useState<boolean>(false)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

    useEffect(() => {
      if (
        !hasQuestionBeenAnswered() &&
        formStep !== localStorage.getItem(storageKey)
      ) {
        localStorage.setItem(storageKey, formStep)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey, formStep, player, selectedYear])

    useEffect(() => {
      const savedFormStep = localStorage.getItem(
        "currentFormStep",
      ) as QuestionFormStep | null
      if (savedFormStep) {
        setFormStep(savedFormStep)
      }
    }, [])

    const { lockDoorAfterAnswer } = useDoors(player, selectedYear)

    const { updatePlayerScore } = useUpdatePlayerScore()

    const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
      if (e) {
        e.preventDefault()
      }
      setIsSubmitted(true)
      lockDoorAfterAnswer(doorNumber).then(() => {
        const answerIsCorrect = selectedOption === question.answer
        setIsCorrect(answerIsCorrect)

        if (player?.id && answerIsCorrect) {
          updatePlayerScore(player, selectedYear.year, question.reward).then(
            () => {
              setFormStep(QuestionFormStep.OUTRO)
            },
          )
        } else {
          // If no updatePlayerScore call is made, go directly to OUTRO
          setFormStep(QuestionFormStep.OUTRO)
        }
      })
    }

    switch (formStep) {
      case QuestionFormStep.ALREADY_ANSWERED:
        return (
          <div className="flex flex-col items-center justify-center gap-6">
            <div>Du hast diese Frage bereits beantwortet.</div>
            <Link className="flex items-center justify-center" href={"./"}>
              <Button>Zurück zum Kalendar</Button>
            </Link>
          </div>
        )
      case QuestionFormStep.QUESTION:
        return (
          <QuestionStep
            setSelectedOption={setSelectedOption}
            handleSubmit={handleSubmit}
            question={question}
            isSubmitted={isSubmitted}
            selectedOption={selectedOption}
          />
        )
      case QuestionFormStep.OUTRO:
        return (
          <OutroStep
            selectedYear={selectedYear}
            isCorrect={isCorrect}
            question={question}
          />
        )
      case QuestionFormStep.INTRO:
      default:
        return <IntroStep setFormStep={setFormStep} question={question} />
    }
  },
)

export default QuestionForm
