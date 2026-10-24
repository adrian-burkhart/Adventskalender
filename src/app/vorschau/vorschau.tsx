"use client"

import { useState, useSyncExternalStore, type ReactNode } from "react"
import Layout from "@/components/layout"
import Loading from "@/components/loading"
import Countdown from "@/components/door/countdown"
import Anticipation from "@/components/door/anticipation"
import Result, { type ResultData } from "@/components/door/result"
import Review from "@/components/door/review"
import type { DoorReview } from "@/lib/door-api"
import ChristmasTree from "@/components/christmas-tree"
import { Board } from "@/components/rangliste"
import type { LeaderboardEntry } from "@/lib/hooks"
import { QUESTION_SECONDS } from "@/lib/doors"

// Previews with example data, for what is hard to reach on staging without
// answering a door.

const demoResult = (isCorrect: boolean): ResultData => ({
  isCorrect,
  correctAnswer: "Glühwein",
  reward: 30,
  points: isCorrect ? 30 : 0,
  score: isCorrect ? 150 : 120,
  outroAudio: null,
  image: null,
  leftPage: false,
  timedOut: false,
  rank: isCorrect ? 2 : 4,
  exchangeOpen: true,
})

const demoReview = (isCorrect: boolean): DoorReview => ({
  question: "Was trinkt man traditionell auf dem Weihnachtsmarkt?",
  options: ["Glühwein", "Eierlikör", "Apfelschorle", "Kakao"],
  correctAnswer: "Glühwein",
  selected: isCorrect ? "Glühwein" : "Kakao",
  isCorrect,
  points: isCorrect ? 30 : 0,
  image: null,
  played: true,
  audio: { intro: null, question: null, outro: null },
})

const ME = "demo-me"
const demoEntries: LeaderboardEntry[] = [
  { player_id: "a", name: "Oma Gerda", score: 210, doors: 10 },
  { player_id: "b", name: "Lukas", score: 180, doors: 10 },
  { player_id: "c", name: "Tante Anni", score: 180, doors: 9 },
  { player_id: ME, name: "Anna", score: 150, doors: 8 },
  { player_id: "d", name: "Opa Heinz", score: 120, doors: 10 },
  { player_id: "e", name: "Marie", score: 90, doors: 6 },
  { player_id: "f", name: "Jonas", score: 30, doors: 3 },
  { player_id: "g", name: "Onkel Bernd", score: 0, doors: 0 },
]

const subscribe = () => () => {}

export default function Vorschau() {
  // The demos run on this device's clock, so they only render in the browser.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  if (!mounted) {
    return (
      <Layout>
        <Loading />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex w-full max-w-4xl flex-col gap-14 px-1">
        <header className="mx-auto max-w-2xl card px-6 py-5 text-center">
          <h1 className="text-4xl">Vorschau</h1>
          <p className="mt-3 text-lg">
            Alles, was man sonst erst nach dem Beantworten eines Türchens sieht,
            mit Beispieldaten.
          </p>
          <p className="mt-2 text-base text-candle/80">
            Auf Staging ist heute der 10. Dezember 2025: Die Türchen 1 bis 10
            lassen sich auch wirklich öffnen.
          </p>
          <nav className="mt-4 flex flex-wrap justify-center gap-2 text-base">
            {[
              ["#countdown", "Countdown"],
              ["#vor-dem-ergebnis", "Vor dem Ergebnis"],
              ["#ergebnis", "Ergebnis"],
              ["#baum", "Baum"],
              ["#rangliste", "Rangliste"],
              ["#rueckblick", "Beantwortetes Türchen"],
            ].map(([href, text]) => (
              <a
                key={href}
                href={href}
                className="rounded-[12px] border border-gold/50 px-3 py-1 hover:bg-gold/10"
              >
                {text}
              </a>
            ))}
          </nav>
        </header>

        <Section
          id="countdown"
          title="Countdown"
          intro="Der Wichtel denkt nach, während neben ihm ein Schneemann entsteht. Ist er fertig, ist die Zeit um."
        >
          <CountdownDemo />
        </Section>

        <Section
          id="vor-dem-ergebnis"
          title="Vor dem Ergebnis"
          intro="Läuft von selbst, während der Jingle am Anfang der Auflösung spielt, und endet genau mit ihm."
        >
          <AnticipationDemo />
        </Section>

        <ResultSection />

        <TreeSection />

        <Section
          id="rangliste"
          title="Rangliste"
          intro="„Gemeinsam geschafft“ über der Liste, neben jedem Namen der eigene Weihnachtsbaum. Den Fallschirm-Wichtel siehst du auf der echten Rangliste."
        >
          <div className="flex justify-center">
            <Board entries={demoEntries} myId={ME} unlocked={10} decorated />
          </div>
        </Section>

        <ReviewSection />
      </div>
    </Layout>
  )
}

function Section({
  id,
  title,
  intro,
  children,
  extra,
}: {
  id: string
  title: string
  intro: string
  children: ReactNode
  extra?: ReactNode
}) {
  return (
    <section id={id} className="flex scroll-mt-4 flex-col gap-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl">{title}</h2>
        <p className="mt-2 text-lg text-candle/90">{intro}</p>
        {extra}
      </div>
      {children}
    </section>
  )
}

function Replay({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className="text-base underline underline-offset-4"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function CountdownDemo() {
  const [deadline, setDeadline] = useState(
    () => Date.now() + QUESTION_SECONDS * 1000,
  )
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 card px-4 py-6">
      <Countdown
        key={deadline}
        deadline={deadline}
        isSubmitted={false}
        onComplete={() => {}}
      />
      <div className="flex flex-wrap justify-center gap-2">
        <Replay
          onClick={() => setDeadline(Date.now() + QUESTION_SECONDS * 1000)}
        >
          Neu starten
        </Replay>
        <span aria-hidden>·</span>
        <Replay onClick={() => setDeadline(Date.now() + 11 * 1000)}>
          Letzte 10 Sekunden
        </Replay>
      </div>
    </div>
  )
}

function AnticipationDemo() {
  const [round, setRound] = useState(0)
  const [done, setDone] = useState(false)
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-2 card px-4 py-6">
      {done ? (
        <div className="flex h-80 flex-col items-center justify-center gap-4 text-center">
          <p className="text-lg">Jetzt käme das Ergebnis.</p>
          <Replay
            onClick={() => {
              setDone(false)
              setRound(round + 1)
            }}
          >
            Nochmal abspielen
          </Replay>
        </div>
      ) : (
        <Anticipation key={round} started onDone={() => setDone(true)} />
      )}
    </div>
  )
}

function ResultSection() {
  const [isCorrect, setIsCorrect] = useState(true)
  const toggle = (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      {[
        [true, "Richtig beantwortet"],
        [false, "Falsch beantwortet"],
      ].map(([value, text]) => (
        <button
          key={String(value)}
          type="button"
          aria-pressed={isCorrect === value}
          onClick={() => setIsCorrect(value as boolean)}
          className="rounded-[12px] border-2 border-gold/60 px-4 py-1 text-base aria-pressed:bg-gold aria-pressed:text-pine-950"
        >
          {text as string}
        </button>
      ))}
    </div>
  )
  return (
    <Section
      id="ergebnis"
      title="Ergebnis"
      intro="Der gemalte Wichtel jubelt bei richtig und zuckt bei falsch mit den Schultern."
      extra={toggle}
    >
      <div className="flex justify-center">
        <Result
          key={String(isCorrect)}
          result={demoResult(isCorrect)}
          doorNumber={7}
        />
      </div>
    </Section>
  )
}

function TreeSection() {
  const [count, setCount] = useState(8)
  return (
    <Section
      id="baum"
      title="Weihnachtsbaum"
      intro="Für jedes beantwortete Türchen hängt etwas am Baum, egal ob richtig oder falsch: meist eine Kugel, jedes dritte Mal ein Stern."
    >
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 card px-4 py-6">
        <ChristmasTree ornaments={count} className="w-64" />
        <label className="flex w-full flex-col items-center gap-2 text-base">
          Beantwortete Türchen: {count}
          <input
            type="range"
            min={0}
            max={24}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-gold"
          />
        </label>
      </div>
    </Section>
  )
}

function ReviewSection() {
  const [isCorrect, setIsCorrect] = useState(false)
  return (
    <Section
      id="rueckblick"
      title="Beantwortetes Türchen"
      intro="Schon beantwortete Türchen lassen sich wieder anklicken: Frage, richtige Antwort und die eigene, nur zum Anschauen."
      extra={<Toggle value={isCorrect} onChange={setIsCorrect} />}
    >
      <div className="flex justify-center">
        <Review review={demoReview(isCorrect)} year="2025" doorNumber={7} />
      </div>
    </Section>
  )
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      {(
        [
          [true, "Richtig beantwortet"],
          [false, "Falsch beantwortet"],
        ] as const
      ).map(([option, text]) => (
        <button
          key={String(option)}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className="rounded-[12px] border-2 border-gold/60 px-4 py-1 text-base aria-pressed:bg-gold aria-pressed:text-pine-950"
        >
          {text}
        </button>
      ))}
    </div>
  )
}
