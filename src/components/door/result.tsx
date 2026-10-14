"use client"

import clsx from "clsx"
import Image from "next/image"
import { memo, useEffect } from "react"
import { ButtonLink } from "@/components/button"
import AudioPlayer from "@/components/audio-player"
import type { DoorResponse, SeasonDoor } from "@/lib/door-api"
import { useDesign, type DesignChoice } from "@/lib/design-variants"
import { warmChord } from "@/lib/chime"
import solutionImage from "../../../public/images/solution.webp"
import shrugImage from "../../../public/images/shrug.webp"

export type ResultVariant = DesignChoice<"result">
export type ResultData = Omit<
  Extract<DoorResponse, { status: "result" }>,
  "status"
>

/**
 * The result after the present opens. A right answer should feel like a
 * small gift; a wrong one like "never mind, see you tomorrow".
 */
const Result = memo(
  ({
    result,
    doorNumber,
    variant,
    preview = false,
  }: {
    result: ResultData
    doorNumber: number
    /** Overrides the chosen design (for /vorschau). */
    variant?: ResultVariant
    /** No sound and no buttons (for /vorschau). */
    preview?: boolean
  }) => {
    const chosen = useDesign("result")
    const which = variant ?? chosen

    useEffect(() => {
      if (!preview && result.isCorrect) warmChord()
    }, [preview, result.isCorrect])

    const props = { result, doorNumber }
    return (
      <div className="flex w-full flex-col items-center gap-8">
        {!preview && result.outroAudio && (
          <AudioPlayer smallButton url={result.outroAudio} autoPlay />
        )}
        {which === "baum" ? (
          <TreeResult {...props} />
        ) : which === "lebkuchen" ? (
          <GingerbreadResult {...props} />
        ) : (
          <CardResult {...props} />
        )}
        {!preview && <Actions />}
      </div>
    )
  },
)

interface VariantProps {
  result: ResultData
  doorNumber: number
}

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

// --- Proposal 1: a Christmas card with a wax seal ------------------------------

function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 40" className={className} aria-hidden>
      <path
        d="M4 34 C24 20 48 14 76 8"
        stroke="#2f6b3a"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {[10, 22, 34, 46, 58].map((x, i) => (
        <g key={x}>
          <path
            d={`M${x} ${32 - i * 5} l-6 -10`}
            stroke="#3c8f4e"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d={`M${x} ${32 - i * 5} l8 -6`}
            stroke="#3c8f4e"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      ))}
      <circle cx="16" cy="34" r="4" fill="#c62f2f" />
      <circle cx="23" cy="36" r="3.5" fill="#c62f2f" />
    </svg>
  )
}

function CardResult({ result, doorNumber }: VariantProps) {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="relative w-full max-w-md -rotate-1 animate-rise-in rounded-xl bg-paper px-6 pb-8 pt-10 text-center text-pine-900 shadow-[0_20px_50px_rgb(0_0_0/0.5)] outline outline-2 -outline-offset-[10px] outline-gold">
        <Sprig className="absolute left-3 top-3 w-20" />
        <Sprig className="absolute right-3 top-3 w-20 -scale-x-100" />
        {result.isCorrect && (
          <div className="seal absolute -right-1 -top-5 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-berry text-candle-soft shadow-[inset_0_0_0_4px_rgb(142_29_29),0_6px_14px_rgb(0_0_0/0.4)]">
            <span className="font-display text-3xl leading-none">
              +{result.reward}
            </span>
            <span className="text-xs uppercase tracking-wider">Punkte</span>
          </div>
        )}
        <Image
          src={result.isCorrect ? solutionImage : shrugImage}
          alt=""
          className="mx-auto h-auto w-40"
        />
        <h2
          className={clsx(
            "mt-2 text-4xl",
            result.isCorrect ? "!text-berry" : "!text-pine-800",
          )}
        >
          <Headline result={result} />
        </h2>
        <div className="mt-4 flex flex-col gap-3 text-lg">
          <Explanation result={result} />
          <Standing result={result} />
          {!result.isCorrect && <Encouragement doorNumber={doorNumber} />}
        </div>
      </div>
      <SolutionPicture result={result} />
    </div>
  )
}

// --- Proposal 2: every answer decorates your tree ------------------------------

const ORNAMENT_COLORS = [
  "#c62f2f",
  "#e9c46a",
  "#3a7bd5",
  "#d65db1",
  "#f08a24",
  "#c0c0c0",
]

/** 24 places on the tree, top to bottom, a few per branch. */
const SLOTS: { x: number; y: number }[] = (() => {
  const rows = [2, 3, 4, 4, 5, 6]
  const slots: { x: number; y: number }[] = []
  rows.forEach((count, row) => {
    const y = 70 + row * 32
    const half = ((y - 24) / 210) * 92 * 0.78
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1)
      // Every other row shifts a little, so they don't line up.
      const x = 110 - half + t * half * 2 + (row % 2 ? 4 : -4)
      slots.push({ x, y: y + (i % 2 ? 6 : 0) })
    }
  })
  return slots
})()

function TreeResult({ result, doorNumber }: VariantProps) {
  // The server lists this door already; a test-mode answer is added here.
  const season: SeasonDoor[] = result.season.some((d) => d.door === doorNumber)
    ? result.season
    : [...result.season, { door: doorNumber, correct: result.isCorrect }]
  const baubles = season.filter((d) => d.correct).length
  const straw = season.length - baubles

  return (
    <div className="card flex w-full max-w-lg animate-rise-in flex-col items-center gap-4 px-5 py-6 text-center">
      <h2 className="text-4xl">
        <Headline result={result} />
      </h2>
      <p className="text-lg">
        {result.isCorrect
          ? "Eine neue Kugel für deinen Baum!"
          : "Dafür bekommt dein Baum einen Strohstern."}
      </p>
      <svg viewBox="0 0 220 290" className="h-80 w-auto" aria-hidden>
        <defs>
          <radialGradient id="tree-glow">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="110" cy="150" r="130" fill="url(#tree-glow)" />
        <rect x="98" y="240" width="24" height="30" rx="3" fill="#6e4426" />
        <path
          d="M110 24 L40 120 H70 L28 186 H62 L18 246 H202 L158 186 H192 L150 120 H180 Z"
          fill="#1f6b3a"
        />
        <path
          d="M110 24 L40 120 H70 L28 186 H62 L18 246 H202 L158 186 H192 L150 120 H180 Z"
          fill="none"
          stroke="#2f8a4a"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Snow on the branches. */}
        <path
          d="M40 120 q15 -6 30 0 M28 186 q17 -6 34 0 M18 246 q20 -6 40 0 M150 120 q15 -6 30 0 M158 186 q17 -6 34 0 M162 246 q20 -6 40 0"
          stroke="#f4f7f5"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        {/* The star on top. */}
        <path
          d="M110 4 l5.9 12 13.2 1.9 -9.6 9.3 2.3 13.1 -11.8 -6.2 -11.8 6.2 2.3 -13.1 -9.6 -9.3 13.2 -1.9z"
          fill="#fef08a"
          style={{ filter: "drop-shadow(0 0 6px #fef08a)" }}
        />
        {SLOTS.map((slot, i) => {
          const door = i + 1
          const entry = season.find((d) => d.door === door)
          if (!entry) {
            return (
              <circle
                key={door}
                cx={slot.x}
                cy={slot.y}
                r="2"
                fill="#fef08a"
                opacity="0.35"
              />
            )
          }
          const isNew = door === doorNumber
          return (
            <g
              key={door}
              className={isNew ? "ornament-new" : undefined}
              style={{ transformOrigin: `${slot.x}px ${slot.y}px` }}
            >
              {entry.correct ? (
                <>
                  <line
                    x1={slot.x}
                    y1={slot.y - 13}
                    x2={slot.x}
                    y2={slot.y - 8}
                    stroke="#e9c46a"
                    strokeWidth="1"
                  />
                  <rect
                    x={slot.x - 2.5}
                    y={slot.y - 10}
                    width="5"
                    height="3"
                    fill="#b8862b"
                  />
                  <circle
                    cx={slot.x}
                    cy={slot.y}
                    r="8"
                    fill={ORNAMENT_COLORS[door % ORNAMENT_COLORS.length]}
                  />
                  <circle
                    cx={slot.x - 2.5}
                    cy={slot.y - 2.5}
                    r="2.2"
                    fill="white"
                    opacity="0.7"
                  />
                </>
              ) : (
                <path
                  transform={`translate(${slot.x} ${slot.y}) scale(0.62)`}
                  d="M0 -12 L3 -4 L12 -4 L5 2 L8 11 L0 5 L-8 11 L-5 2 L-12 -4 L-3 -4 Z"
                  fill="#f3e2b0"
                  stroke="#b8862b"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              )}
              {isNew && (
                <circle
                  cx={slot.x}
                  cy={slot.y}
                  r="14"
                  fill="none"
                  stroke="#fef08a"
                  strokeWidth="2"
                  className="ornament-ring"
                />
              )}
            </g>
          )
        })}
      </svg>
      <p className="text-base text-candle/85">
        An deinem Baum {baubles === 1 ? "hängt" : "hängen"} jetzt{" "}
        {baubles === 1 ? "eine Kugel" : `${baubles} Kugeln`}
        {straw > 0 && (
          <> und {straw === 1 ? "ein Strohstern" : `${straw} Strohsterne`}</>
        )}
        .
      </p>
      <div className="flex flex-col gap-3 text-lg">
        <Explanation result={result} />
        <Standing result={result} />
        {!result.isCorrect && <Encouragement doorNumber={doorNumber} />}
      </div>
      <SolutionPicture result={result} />
    </div>
  )
}

// --- Proposal 3: a gingerbread heart from the Christmas market ----------------

const HEART =
  "M120 206 C70 170 18 132 18 78 C18 44 44 22 74 22 C96 22 112 34 120 50 C128 34 144 22 166 22 C196 22 222 44 222 78 C222 132 170 170 120 206 Z"

function GingerbreadResult({ result, doorNumber }: VariantProps) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
      <div className="gingerbread-swing" style={{ transformOrigin: "50% 0%" }}>
        <svg viewBox="0 0 240 240" className="h-72 w-auto sm:h-80" aria-hidden>
          <defs>
            <radialGradient id="ginger" cx="45%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#b8733d" />
              <stop offset="100%" stopColor="#7a4420" />
            </radialGradient>
          </defs>
          {/* Ribbon to hang it around your neck. */}
          <path
            d="M70 34 C80 -10 160 -10 170 34"
            stroke="#c62f2f"
            strokeWidth="5"
            fill="none"
          />
          <path
            d={HEART}
            fill="url(#ginger)"
            stroke="#5c3015"
            strokeWidth="3"
          />
          <path
            d={HEART}
            transform="translate(120 112) scale(0.86) translate(-120 -112)"
            fill="none"
            stroke="#fdf6ec"
            strokeWidth="5"
            strokeDasharray="0.1 9"
            strokeLinecap="round"
          />
          {/* Icing flowers. */}
          {[
            [62, 60],
            [178, 60],
          ].map(([x, y]) => (
            <g key={x} fill={result.isCorrect ? "#f2a7b8" : "#a7d3f2"}>
              {[0, 72, 144, 216, 288].map((a) => (
                <circle
                  key={a}
                  cx={x + Math.cos((a * Math.PI) / 180) * 6}
                  cy={y + Math.sin((a * Math.PI) / 180) * 6}
                  r="4"
                />
              ))}
              <circle cx={x} cy={y} r="3.5" fill="#fdf6ec" />
            </g>
          ))}
          <text
            x="120"
            y={result.isCorrect ? 108 : 112}
            textAnchor="middle"
            fontSize={result.isCorrect ? 34 : 30}
            fill="#fdf6ec"
            className="font-display"
            style={{ paintOrder: "stroke", stroke: "#5c3015", strokeWidth: 1 }}
          >
            {result.isCorrect ? "Richtig!" : "Kopf hoch!"}
          </text>
          <text
            x="120"
            y="146"
            textAnchor="middle"
            fontSize="20"
            fill="#fdf6ec"
            className="font-display"
          >
            {result.isCorrect ? `+${result.reward} Punkte` : "Morgen wieder"}
          </text>
        </svg>
      </div>
      <div className="card flex w-full flex-col gap-3 px-5 py-5 text-lg">
        <Explanation result={result} />
        <Standing result={result} />
        {!result.isCorrect && <Encouragement doorNumber={doorNumber} />}
      </div>
      <SolutionPicture result={result} />
    </div>
  )
}

export default Result
