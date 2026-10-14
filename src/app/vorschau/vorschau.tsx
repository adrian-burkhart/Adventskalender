"use client"

import clsx from "clsx"
import { useState, useSyncExternalStore, type ReactNode } from "react"
import Layout from "@/components/layout"
import Button from "@/components/button"
import Loading from "@/components/loading"
import Countdown, { type CountdownVariant } from "@/components/door/countdown"
import Present, { type PresentVariant } from "@/components/door/present"
import Result, { type ResultData } from "@/components/door/result"
import ChristmasTree from "@/components/christmas-tree"
import { Board } from "@/components/rangliste"
import {
  DESIGN_OPTIONS,
  useChooseDesign,
  useDesign,
  type DesignChoice,
  type DesignPart,
} from "@/lib/design-variants"
import type { LeaderboardEntry } from "@/lib/hooks"
import { QUESTION_SECONDS } from "@/lib/doors"

// Example data, so everything can be seen without answering a door.

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
      <div className="flex w-full max-w-6xl flex-col gap-14 px-1">
        <header className="card mx-auto max-w-2xl px-6 py-5 text-center">
          <h1 className="text-4xl">Design-Vorschau</h1>
          <p className="mt-3 text-lg">
            Bei Schrift, Knöpfen, Schnee und Geschenk gibt es mehrere
            Vorschläge. Tippe auf „Verwenden“, dann zeigt die ganze App auf
            diesem Gerät genau diesen Vorschlag, auch die echten Türchen.
          </p>
          <p className="mt-2 text-base text-candle/80">
            Auf Staging ist heute der 10. Dezember 2025: Die Türchen 1 bis 10
            lassen sich öffnen.
          </p>
          <nav className="mt-4 flex flex-wrap justify-center gap-2 text-base">
            {[
              ["#schrift", "Schrift"],
              ["#knoepfe", "Knöpfe"],
              ["#schnee", "Schnee"],
              ["#geschenk", "Geschenk"],
              ["#countdown", "Countdown"],
              ["#ergebnis", "Ergebnis"],
              ["#baum", "Baum"],
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
          id="schrift"
          title="Schrift der Überschriften"
          intro="Nur für Überschriften. Der Text bleibt in der gut lesbaren Lora, die Türchennummern bleiben in Cochin."
        >
          <Tiles part="font">
            {(id) => (
              <div
                className="text-center"
                style={{ fontFamily: `var(--font-${id})` }}
              >
                <div className="text-4xl text-candle">Hallo Oma Gerda!</div>
                <div className="mt-2 text-3xl text-candle">
                  Gemeinsam geschafft
                </div>
              </div>
            )}
          </Tiles>
        </Section>

        <Section
          id="knoepfe"
          title="Knöpfe"
          intro="Angelehnt an die gemalten Bilder: der Play-Knopf mit dem Weihnachtsmann und der „Bereit“-Knopf mit der Tannengirlande."
        >
          <Tiles part="buttons">
            {(id) => (
              <div
                className={clsx(
                  `preview-${id}`,
                  "flex flex-col items-center gap-4 py-2",
                )}
              >
                <Button>Zurück zum Kalender</Button>
                <Button quiet>Zur Rangliste</Button>
                <Button disabled>Bestätigen</Button>
              </div>
            )}
          </Tiles>
        </Section>

        <Section
          id="schnee"
          title="Schnee"
          intro="Der Schnee fällt hinter der ganzen Seite. Tippe auf „Verwenden“ und schau dir den Hintergrund an."
        >
          <Tiles part="snow">{() => null}</Tiles>
        </Section>

        <Section
          id="geschenk"
          title="Geschenk"
          intro="Erscheint nach dem Antworten und öffnet sich erst, wenn man darauf tippt. Weich gemalt, ohne Glitzerstrahlen."
        >
          <Tiles part="present">{(id) => <PresentDemo variant={id} />}</Tiles>
        </Section>

        <Section
          id="countdown"
          title="Countdown"
          intro="Neben den Wichteln entsteht ein Schneemann. Ist er fertig, ist die Zeit um. Vorschlag 2 sind zwei in SVG nachgezeichnete Wichtel, kein gemaltes Bild."
        >
          <Tiles part="countdown">
            {(id) => <CountdownDemo variant={id} />}
          </Tiles>
        </Section>

        <ResultSection />

        <TreeSection />

        <Section
          id="rangliste"
          title="Rangliste"
          intro="„Gemeinsam geschafft“ über der bekannten Liste, und neben jedem Namen der eigene Weihnachtsbaum. Den Fallschirm-Wichtel siehst du auf der echten Rangliste."
        >
          <div className="flex justify-center">
            <Board entries={demoEntries} myId={ME} unlocked={10} />
          </div>
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

/** One tile per proposal, with a button to use it in the whole app. */
function Tiles<P extends DesignPart>({
  part,
  children,
}: {
  part: P
  children: (id: DesignChoice<P>) => ReactNode
}) {
  const current = useDesign(part)
  const choose = useChooseDesign()
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {DESIGN_OPTIONS[part].map((option, i) => {
        const id = option.id as DesignChoice<P>
        const active = current === id
        const preview = children(id)
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
              <h3 className="font-body text-2xl font-semibold not-italic">
                {option.name}
              </h3>
              <p className="mt-1 text-base text-candle/85">{option.hint}</p>
            </header>
            {preview && (
              <div className="flex w-full flex-1 flex-col items-center justify-center">
                {preview}
              </div>
            )}
            {active ? (
              <p className="flex min-h-[3rem] items-center font-semibold">
                ✓ Wird verwendet
              </p>
            ) : (
              <button
                type="button"
                onClick={() => choose(part, id)}
                className="min-h-[3rem] rounded-full border-2 border-gold/60 px-6 text-lg hover:bg-gold/10"
              >
                Verwenden
              </button>
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
    <div className="flex w-full flex-col items-center gap-4">
      <Countdown
        key={deadline}
        deadline={deadline}
        isSubmitted={false}
        onComplete={() => {}}
        variant={variant as CountdownVariant}
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
          className="rounded-full border-2 border-gold/60 px-4 py-1 text-base aria-pressed:bg-gold aria-pressed:text-pine-950"
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
      intro="Der gemalte Wichtel steht wieder im Mittelpunkt: jubelnd bei richtig, schulterzuckend bei falsch."
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
      intro="Für jedes beantwortete Türchen hängt etwas am Baum, egal ob richtig oder falsch: meist eine Kugel, jedes dritte Mal ein Stern. Groß auf dem Kalender, klein in der Rangliste."
    >
      <div className="card mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-6">
        <ChristmasTree ornaments={count} className="w-60" />
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
