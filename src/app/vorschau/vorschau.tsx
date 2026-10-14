"use client"

import clsx from "clsx"
import { useState, useSyncExternalStore, type ReactNode } from "react"
import Layout from "@/components/layout"
import Button from "@/components/button"
import Loading from "@/components/loading"
import Countdown, { type CountdownVariant } from "@/components/door/countdown"
import Present, { type PresentVariant } from "@/components/door/present"
import Result, {
  type ResultData,
  type ResultVariant,
} from "@/components/door/result"
import { Board, type RanglisteVariant } from "@/components/rangliste"
import {
  DESIGN_OPTIONS,
  useChooseDesign,
  useDesign,
  type DesignChoice,
  type DesignPart,
} from "@/lib/design-variants"
import type { LeaderboardEntry } from "@/lib/hooks"
import { QUESTION_SECONDS } from "@/lib/doors"

// Example data, so every proposal can be seen without answering a door.

const DEMO_DOOR = 7

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
  playerCount: 12,
  season: [
    { door: 1, correct: true },
    { door: 2, correct: true },
    { door: 3, correct: false },
    { door: 4, correct: true },
    { door: 5, correct: true },
    { door: 6, correct: false },
    { door: DEMO_DOOR, correct: isCorrect },
  ],
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
  { player_id: "h", name: "Clara", score: 0, doors: 0 },
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
      <div className="flex w-full max-w-6xl flex-col gap-14 px-1">
        <header className="card mx-auto max-w-2xl px-6 py-5 text-center">
          <h1 className="text-4xl">Design-Vorschau</h1>
          <p className="mt-3 text-lg">
            Hier siehst du alle Vorschläge mit Beispieldaten. Tippe bei einem
            Vorschlag auf „Im Kalender verwenden“, dann zeigen die echten
            Türchen auf diesem Gerät genau diese Variante.
          </p>
          <p className="mt-2 text-base text-candle/80">
            Auf Staging ist heute der 10. Dezember 2025: Die Türchen 1 bis 10
            lassen sich öffnen.
          </p>
          <nav className="mt-4 flex flex-wrap justify-center gap-2 text-base">
            {[
              ["#countdown", "Countdown"],
              ["#geschenk", "Geschenk"],
              ["#ergebnis", "Ergebnis"],
              ["#rangliste", "Rangliste"],
            ].map(([href, text]) => (
              <a
                key={href}
                href={href}
                className="rounded-full border border-gold/50 px-3 py-1 hover:bg-gold/10"
              >
                {text}
              </a>
            ))}
          </nav>
        </header>

        <Section
          id="countdown"
          title="Countdown"
          intro="Läuft, während die Frage gestellt ist. Die Zahl bleibt immer gut lesbar; in den letzten 10 Sekunden wird es wärmer, aber nicht hektisch."
        >
          <Tiles part="countdown">
            {(id) => <CountdownDemo variant={id} />}
          </Tiles>
        </Section>

        <Section
          id="geschenk"
          title="Geschenk"
          intro="Erscheint nach dem Antworten und öffnet sich erst, wenn man darauf tippt."
        >
          <Tiles part="present">{(id) => <PresentDemo variant={id} />}</Tiles>
        </Section>

        <ResultSection />

        <Section
          id="rangliste"
          title="Rangliste"
          intro="Beide Versionen mit denselben Beispieldaten: gemeinsame Plätze bei gleicher Punktzahl, dein Eintrag hervorgehoben."
        >
          <Tiles part="rangliste" wide>
            {(id) => (
              <Board
                variant={id as RanglisteVariant}
                entries={demoEntries}
                myId={ME}
                unlocked={10}
              />
            )}
          </Tiles>
        </Section>
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

/** One tile per proposal, with a button to use it in the calendar. */
function Tiles<P extends DesignPart>({
  part,
  children,
  wide = false,
}: {
  part: P
  children: (id: DesignChoice<P>) => ReactNode
  wide?: boolean
}) {
  const current = useDesign(part)
  const choose = useChooseDesign()
  return (
    <div
      className={clsx(
        "grid gap-6",
        wide ? "lg:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3",
      )}
    >
      {DESIGN_OPTIONS[part].map((option, i) => {
        const id = option.id as DesignChoice<P>
        const active = current === id
        return (
          <article
            key={id}
            className={clsx(
              "card flex flex-col items-center gap-4 px-4 py-5",
              active && "!border-2 !border-gold",
            )}
          >
            <header className="text-center">
              <div className="text-sm uppercase tracking-wider text-candle/70">
                Vorschlag {i + 1}
              </div>
              <h3 className="text-3xl">{option.name}</h3>
              <p className="mt-1 text-base text-candle/85">{option.hint}</p>
            </header>
            <div className="flex w-full flex-1 flex-col items-center justify-center">
              {children(id)}
            </div>
            {active ? (
              <p className="flex min-h-[3rem] items-center font-semibold">
                ✓ Wird im Kalender verwendet
              </p>
            ) : (
              <Button quiet onClick={() => choose(part, id)}>
                Im Kalender verwenden
              </Button>
            )}
          </article>
        )
      })}
    </div>
  )
}

function CountdownDemo({ variant }: { variant: string }) {
  const [deadline, setDeadline] = useState(
    () => Date.now() + QUESTION_SECONDS * 1000,
  )
  return (
    <div className="flex flex-col items-center gap-4">
      <Countdown
        key={deadline}
        variant={variant as CountdownVariant}
        deadline={deadline}
        isSubmitted={false}
        onComplete={() => {}}
      />
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          className="text-base underline underline-offset-4"
          onClick={() => setDeadline(Date.now() + QUESTION_SECONDS * 1000)}
        >
          Neu starten
        </button>
        <span aria-hidden>·</span>
        <button
          type="button"
          className="text-base underline underline-offset-4"
          onClick={() => setDeadline(Date.now() + 11 * 1000)}
        >
          Letzte 10 Sekunden
        </button>
      </div>
    </div>
  )
}

function PresentDemo({ variant }: { variant: string }) {
  const [round, setRound] = useState(0)
  const [opened, setOpened] = useState(false)
  return opened ? (
    <div className="flex h-72 flex-col items-center justify-center gap-4 text-center sm:h-80">
      <p className="text-lg">Jetzt käme das Ergebnis.</p>
      <button
        type="button"
        className="text-base underline underline-offset-4"
        onClick={() => {
          setOpened(false)
          setRound(round + 1)
        }}
      >
        Nochmal einpacken
      </button>
    </div>
  ) : (
    <Present
      key={round}
      variant={variant as PresentVariant}
      onOpened={() => setOpened(true)}
    />
  )
}

function ResultSection() {
  const [isCorrect, setIsCorrect] = useState(true)
  const [round, setRound] = useState(0)
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
          onClick={() => {
            setIsCorrect(value as boolean)
            setRound(round + 1)
          }}
          className="rounded-full border-2 border-gold/60 px-4 py-1 text-base aria-pressed:bg-gold aria-pressed:text-pine-950"
        >
          {text as string}
        </button>
      ))}
      <button
        type="button"
        className="ml-2 text-base underline underline-offset-4"
        onClick={() => setRound(round + 1)}
      >
        Nochmal abspielen
      </button>
    </div>
  )
  return (
    <Section
      id="ergebnis"
      title="Ergebnis"
      intro="Kommt aus dem Geschenk. Richtig soll sich wie ein kleines Geschenk anfühlen, falsch wie „macht nichts, bis morgen“."
      extra={toggle}
    >
      <Tiles part="result">
        {(id) => (
          <Result
            key={`${round}-${isCorrect}`}
            variant={id as ResultVariant}
            result={demoResult(isCorrect)}
            doorNumber={DEMO_DOOR}
            preview
          />
        )}
      </Tiles>
    </Section>
  )
}
