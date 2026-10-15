"use client"

import clsx from "clsx"
import { memo, useState, type CSSProperties } from "react"
import Layout from "./layout"

export interface HallEntry {
  year: number
  /** More than one when several had the same points. */
  winners: string[]
  score: number
}

const EXAMPLES: HallEntry[] = [
  { year: 2024, winners: ["Oma Gerda"], score: 610 },
  { year: 2022, winners: ["Lukas", "Tante Anni"], score: 560 },
  { year: 2021, winners: ["Opa Heinz"], score: 495 },
  { year: 2020, winners: ["Marie"], score: 470 },
]

const PROPOSALS = [
  { id: 1, title: "Wanderpokal" },
  { id: 2, title: "Am Kamin" },
  { id: 3, title: "Christbaumkugeln" },
] as const

const names = (entry: HallEntry) => entry.winners.join(" & ")

/**
 * The winners of all past seasons, each in their own festive spot. Three
 * proposals to choose from.
 */
const Ruhmeshalle = memo(
  ({
    entries,
    withExamples,
  }: {
    entries: HallEntry[]
    withExamples: boolean
  }) => {
    const [proposal, setProposal] = useState<1 | 2 | 3>(1)
    const [examples, setExamples] = useState(withExamples)
    const shown = (
      examples
        ? [
            ...entries,
            ...EXAMPLES.filter((e) => !entries.some((r) => r.year === e.year)),
          ]
        : entries
    ).sort((a, b) => b.year - a.year)

    return (
      <Layout>
        <div className="flex w-full max-w-5xl flex-col items-center gap-8 px-1">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl">Ruhmeshalle</h1>
            <p className="mt-2 text-lg">
              Die Gewinnerinnen und Gewinner der vergangenen Jahre
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {PROPOSALS.map(({ id, title }) => (
              <button
                key={id}
                type="button"
                aria-pressed={proposal === id}
                onClick={() => setProposal(id)}
                className="rounded-full border-2 border-gold/60 px-4 py-1 text-base aria-pressed:bg-gold aria-pressed:text-pine-950"
              >
                {id}. {title}
              </button>
            ))}
          </div>
          {withExamples && (
            <label className="flex items-center gap-2 text-base text-candle/80">
              <input
                type="checkbox"
                checked={examples}
                onChange={(e) => setExamples(e.target.checked)}
                className="h-5 w-5 accent-gold"
              />
              Mit Beispielen (nur auf Staging)
            </label>
          )}

          {shown.length === 0 ? (
            <p className="card px-6 py-4 text-lg">
              Nach dem ersten Advent steht hier, wer gewonnen hat.
            </p>
          ) : proposal === 1 ? (
            <Trophy entries={shown} />
          ) : proposal === 2 ? (
            <Fireplace entries={shown} />
          ) : (
            <Baubles entries={shown} />
          )}
        </div>
      </Layout>
    )
  },
)

// --- 1. The challenge trophy ----------------------------------------------

/**
 * A golden challenge cup on a wooden plinth. Every winner gets a brass
 * plate engraved with year and name; the newest sits on top and shines.
 */
function Trophy({ entries }: { entries: HallEntry[] }) {
  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <svg
        viewBox="0 0 240 230"
        className="w-64 drop-shadow-[0_0_30px_rgb(250_204_21/0.35)] sm:w-72"
        aria-hidden
      >
        <defs>
          <linearGradient id="cup-gold" x1="0" x2="1">
            <stop offset="0" stopColor="#8a5a12" />
            <stop offset="0.3" stopColor="#f7d774" />
            <stop offset="0.5" stopColor="#fff2b8" />
            <stop offset="0.75" stopColor="#d9a43a" />
            <stop offset="1" stopColor="#7a4d0e" />
          </linearGradient>
        </defs>
        {/* Handles. */}
        <path
          d="M58 52 C14 52 14 118 70 122"
          stroke="url(#cup-gold)"
          strokeWidth="11"
          fill="none"
        />
        <path
          d="M182 52 C226 52 226 118 170 122"
          stroke="url(#cup-gold)"
          strokeWidth="11"
          fill="none"
        />
        {/* Bowl. */}
        <path
          d="M50 30 H190 C190 110 160 142 120 146 C80 142 50 110 50 30 Z"
          fill="url(#cup-gold)"
        />
        <ellipse cx="120" cy="30" rx="70" ry="9" fill="#fff2b8" />
        <ellipse cx="120" cy="31" rx="62" ry="6" fill="#b07d1e" />
        {/* A star on the bowl. */}
        <path
          d="M120 62 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2 z"
          fill="#fff6cf"
          opacity="0.9"
        />
        {/* Stem and foot. */}
        <path d="M110 146 H130 L128 182 H112 Z" fill="url(#cup-gold)" />
        <path
          d="M82 200 Q82 182 120 182 Q158 182 158 200 Z"
          fill="url(#cup-gold)"
        />
        <rect
          x="70"
          y="198"
          width="100"
          height="12"
          rx="3"
          fill="url(#cup-gold)"
        />
        {/* A ribbon on one handle. */}
        <path d="M172 60 l18 -6 -4 12 6 10 -18 -2 z" fill="#b91c1c" />
        <path d="M180 66 l-4 30 8 -6 6 8 -2 -32 z" fill="#991b1b" />
      </svg>

      {/* The plinth with its plates. */}
      <div className="w-full rounded-b-2xl rounded-t-md border-t-4 border-[#5a3820] bg-gradient-to-b from-[#7a4a26] to-[#4a2c16] px-5 pb-6 pt-5 shadow-2xl">
        <ol className="flex flex-col gap-3">
          {entries.map((entry, i) => (
            <li
              key={entry.year}
              className={clsx(
                "rounded-md border border-[#7a5a1e] bg-gradient-to-b from-[#f3d98a] via-[#d9b25a] to-[#b38a36] px-4 py-2 text-center text-[#3b2a10] shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_2px_4px_rgb(0_0_0/0.4)]",
                i === 0 &&
                  "shadow-[0_0_18px_rgb(250_204_21/0.5)] ring-2 ring-[#fff2b8]/70",
              )}
            >
              <div className="font-display text-base tracking-[0.2em]">
                {entry.year}
              </div>
              <div className="font-display text-2xl leading-tight [text-shadow:0_1px_0_rgb(255_255_255/0.5)]">
                {names(entry)}
              </div>
              <div className="text-sm">{entry.score} Punkte</div>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-6 text-center text-lg">Wer gewinnt, wird eingraviert.</p>
    </div>
  )
}

// --- 2. Stockings on the mantelpiece ---------------------------------------

const STOCKINGS = ["#b91c1c", "#166534", "#9f1239", "#1e3a8a"]

/**
 * A mantelpiece with a garland. For each year a stocking hangs from it,
 * the year on the white cuff and the winner's name stitched on. Below, the
 * fire crackles.
 */
function Fireplace({ entries }: { entries: HallEntry[] }) {
  return (
    <div className="flex w-full max-w-3xl flex-col items-center">
      {/* Mantelpiece with garland and lights. */}
      <div className="relative z-10 h-8 w-full rounded-md bg-gradient-to-b from-[#8b5a2b] to-[#5a3820] shadow-xl">
        <svg
          viewBox="0 0 600 30"
          preserveAspectRatio="none"
          className="absolute inset-x-0 -bottom-4 h-8 w-full"
          aria-hidden
        >
          <path
            d="M0 6 Q37 26 75 6 T150 6 T225 6 T300 6 T375 6 T450 6 T525 6 T600 6"
            stroke="#1f5a32"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
          />
          {Array.from({ length: 16 }, (_, i) => (
            <circle
              key={i}
              cx={18 + i * 37.5}
              cy={i % 2 ? 10 : 18}
              r="3.5"
              fill={["#fcd34d", "#ef4444", "#fef3c7"][i % 3]}
              className="hall-twinkle"
              style={{ animationDelay: `${(i % 5) * 0.4}s` }}
            />
          ))}
        </svg>
      </div>

      <ul className="-mt-1 flex w-full flex-wrap justify-center gap-x-2 gap-y-6 rounded-b-xl px-1 pb-8 pt-6 shadow-[inset_0_0_60px_rgb(0_0_0/0.55)] [background:repeating-linear-gradient(0deg,#5b2a1c_0_2px,transparent_2px_26px),repeating-linear-gradient(90deg,#5b2a1c_0_2px,transparent_2px_52px),#7a3a26] sm:gap-x-4 sm:px-3">
        {entries.map((entry, i) => (
          <li key={entry.year} className="flex flex-col items-center">
            <div className="h-5 w-0.5 bg-[#d9b25a]" />
            <Stocking
              color={STOCKINGS[i % STOCKINGS.length]}
              year={entry.year}
              name={names(entry)}
              score={entry.score}
              tilt={i % 2 ? 3 : -3}
            />
          </li>
        ))}
      </ul>

      {/* The hearth. */}
      <div className="relative flex h-28 w-full max-w-md items-end justify-center overflow-hidden rounded-t-[3rem] border-8 border-b-0 border-[#7c2d12] bg-[#1c0d08]">
        <div className="hall-flame absolute bottom-3 h-20 w-16 rounded-[50%_50%_45%_45%] bg-gradient-to-t from-[#f97316] via-[#fbbf24] to-[#fde68a] blur-[2px]" />
        <div className="hall-flame absolute bottom-3 ml-16 h-14 w-10 rounded-[50%_50%_45%_45%] bg-gradient-to-t from-[#ea580c] to-[#fcd34d] blur-[2px] [animation-delay:0.3s]" />
        <div className="hall-flame absolute bottom-3 mr-16 h-12 w-10 rounded-[50%_50%_45%_45%] bg-gradient-to-t from-[#ea580c] to-[#fcd34d] blur-[2px] [animation-delay:0.6s]" />
        <div className="absolute bottom-0 h-4 w-48 rounded-full bg-[#4a2c16]" />
      </div>
    </div>
  )
}

function Stocking({
  color,
  year,
  name,
  score,
  tilt,
}: {
  color: string
  year: number
  name: string
  score: number
  tilt: number
}) {
  return (
    <div
      className="relative w-36 origin-top sm:w-40"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <svg viewBox="0 0 160 210" className="w-full drop-shadow-lg" aria-hidden>
        <path
          d="M30 40 H112 V140 C112 150 120 156 132 160 C152 166 156 196 132 202 C110 208 76 200 54 186 C30 170 30 150 30 130 Z"
          fill={color}
        />
        <path
          d="M30 40 H112 V140 C112 150 120 156 132 160 C152 166 156 196 132 202 C110 208 76 200 54 186 C30 170 30 150 30 130 Z"
          fill="url(#stocking-shade)"
        />
        <defs>
          <linearGradient id="stocking-shade" x1="0" x2="1">
            <stop offset="0" stopColor="white" stopOpacity="0.12" />
            <stop offset="1" stopColor="black" stopOpacity="0.25" />
          </linearGradient>
        </defs>
        {/* Fluffy cuff. */}
        <rect x="22" y="8" width="98" height="40" rx="14" fill="#f8fafc" />
        <circle cx="32" cy="12" r="6" fill="#f8fafc" />
        {/* A sprig of holly on the cuff. */}
        <path
          d="M104 44 q10 -10 22 -4 q-6 2 -6 8 q-8 -4 -16 -4 z"
          fill="#166534"
        />
        <path
          d="M104 44 q-2 14 8 22 q0 -6 6 -8 q-8 -6 -14 -14 z"
          fill="#15803d"
        />
        <circle cx="103" cy="44" r="3.6" fill="#dc2626" />
        <circle cx="98" cy="49" r="3.2" fill="#b91c1c" />
      </svg>
      <div className="absolute inset-x-0 top-3 text-center font-display text-xl text-[#7f1d1d]">
        {year}
      </div>
      <div className="absolute left-5 right-10 top-[34%] text-center">
        <div className="font-display text-xl leading-tight text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.5)]">
          {name}
        </div>
        <div className="mt-1 text-sm text-white/85">{score} Punkte</div>
      </div>
    </div>
  )
}

// --- 3. Engraved baubles ---------------------------------------------------

const BAUBLES = [
  ["#ef4444", "#7f1d1d"],
  ["#fbbf24", "#92400e"],
  ["#22c55e", "#14532d"],
  ["#60a5fa", "#1e3a8a"],
  ["#e879f9", "#701a75"],
] as const

/**
 * A fir branch across the page; for every year a large glass bauble hangs
 * from it on a ribbon, swaying gently, with year and name engraved in gold.
 */
function Baubles({ entries }: { entries: HallEntry[] }) {
  return (
    <div className="flex w-full flex-col items-center">
      <Bough />
      <ul className="-mt-2 flex w-full flex-wrap items-start justify-center gap-x-3 gap-y-4 sm:gap-x-6">
        {entries.map((entry, i) => (
          <li key={entry.year}>
            <Bauble
              colors={BAUBLES[i % BAUBLES.length]}
              year={entry.year}
              name={names(entry)}
              score={entry.score}
              drop={[24, 56, 36, 64, 28][i % 5]}
              delay={i * 0.7}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Same numbers on every render, so server and browser agree. */
function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

/** A fir bough with needles in every direction, berries and cones. */
function Bough() {
  const random = seeded(11)
  const along = (x: number) => 34 - Math.sin((x / 800) * Math.PI) * 14
  const needles = Array.from({ length: 260 }, () => {
    const x = random() * 800
    const y = along(x) + (random() - 0.5) * 6
    const angle = (random() * 2 - 1) * 75 + (random() < 0.5 ? 0 : 180)
    const length = 12 + random() * 12
    const rad = (angle * Math.PI) / 180
    return {
      x,
      y,
      x2: x + Math.cos(rad) * length,
      y2: y + Math.sin(rad) * length * 0.8,
      color: ["#14532d", "#166534", "#1f6b3a", "#2f7a43"][
        Math.floor(random() * 4)
      ],
    }
  })
  return (
    <svg
      viewBox="0 0 800 70"
      preserveAspectRatio="none"
      className="h-16 w-full"
      aria-hidden
    >
      <path
        d="M0 34 Q400 6 800 34"
        stroke="#5a3820"
        strokeWidth="6"
        fill="none"
      />
      {needles.map((n, i) => (
        <line
          key={i}
          x1={n.x}
          y1={n.y}
          x2={n.x2}
          y2={n.y2}
          stroke={n.color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      {[120, 330, 520, 700].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={along(x) + 12} rx="7" ry="11" fill="#7a4a26" />
          <path
            d={`M${x - 6} ${along(x) + 8} h12 M${x - 6} ${along(x) + 14} h12`}
            stroke="#4a2c16"
            strokeWidth="1.5"
          />
        </g>
      ))}
      {[60, 230, 420, 610, 760].map((x) => (
        <g key={x} fill="#dc2626">
          <circle cx={x} cy={along(x) - 4} r="4" />
          <circle cx={x + 7} cy={along(x) - 1} r="4" />
          <circle cx={x + 3} cy={along(x) + 5} r="4" />
        </g>
      ))}
    </svg>
  )
}

function Bauble({
  colors,
  year,
  name,
  score,
  drop,
  delay,
}: {
  colors: readonly [string, string]
  year: number
  name: string
  score: number
  drop: number
  delay: number
}) {
  const id = `bauble-${year}`
  return (
    <div
      className="hall-swing flex origin-top flex-col items-center"
      style={{ animationDelay: `${-delay}s` } as CSSProperties}
    >
      <div className="w-0.5 bg-[#d9b25a]" style={{ height: drop }} />
      <div className="relative w-36 sm:w-48">
        <svg
          viewBox="0 0 200 220"
          className="w-full drop-shadow-[0_8px_16px_rgb(0_0_0/0.45)]"
          aria-hidden
        >
          <defs>
            <radialGradient id={id} cx="35%" cy="35%" r="75%">
              <stop offset="0" stopColor="white" stopOpacity="0.9" />
              <stop offset="0.15" stopColor={colors[0]} />
              <stop offset="1" stopColor={colors[1]} />
            </radialGradient>
          </defs>
          {/* Cap and loop. */}
          <circle
            cx="100"
            cy="8"
            r="7"
            fill="none"
            stroke="#d9b25a"
            strokeWidth="3"
          />
          <rect x="84" y="12" width="32" height="18" rx="3" fill="#d9b25a" />
          <circle cx="100" cy="122" r="92" fill={`url(#${id})`} />
          {/* The gold band with the year. */}
          <path
            d="M14 96 Q100 78 186 96 L188 120 Q100 102 12 120 Z"
            fill="#e8c46a"
            opacity="0.95"
          />
          <ellipse
            cx="66"
            cy="66"
            rx="22"
            ry="12"
            fill="white"
            opacity="0.35"
            transform="rotate(-30 66 66)"
          />
        </svg>
        <div className="absolute inset-x-0 top-[41%] text-center font-display text-xl tracking-[0.2em] text-[#5a3a0a]">
          {year}
        </div>
        <div className="absolute inset-x-6 top-[58%] text-center sm:inset-x-8">
          <div className="font-display text-lg leading-tight text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.6)] sm:text-xl">
            {name}
          </div>
          <div className="text-sm text-white/90">{score} Punkte</div>
        </div>
      </div>
    </div>
  )
}

export default Ruhmeshalle
