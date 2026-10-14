"use client"

import { useLeaderboard, usePlayer, type LeaderboardEntry } from "@/lib/hooks"
import Layout from "@/components/layout"
import { useSelectedYear } from "@/lib/context"
// The picture without the parachute Wichtel: he flies on his own.
import ranglisteImage from "../../public/images/rangliste-ohne-wichtel.webp"
import { memo, useRef, useState } from "react"
import Image from "next/image"
import clsx from "clsx"
import { ERROR_TEXT } from "@/lib/texts"
import { ranks } from "@/lib/ranking"
import ChristmasTree from "./christmas-tree"
import DriftingWichtel from "./drifting-wichtel"
import Loading from "./loading"

const Rangliste = memo(
  ({
    initial,
    scoreYears,
    currentYear,
    unlockedNow,
  }: {
    /** The current year's leaderboard, rendered on the server. */
    initial?: { year: string; entries: LeaderboardEntry[] }
    scoreYears: number[]
    currentYear: string
    /** Doors open so far in the current year; earlier years had all 24. */
    unlockedNow: number
  }) => {
    const { selectedYear } = useSelectedYear()
    const { player } = usePlayer()
    const [chosenYear, setChosenYear] = useState<string | null>(null)
    const picture = useRef<HTMLDivElement>(null)
    const year = chosenYear ?? selectedYear?.year ?? initial?.year ?? null
    const { entries, error, loading } = useLeaderboard(year, initial)

    // Every year with points, plus the current one, newest first.
    const years = [
      ...new Set(
        [...scoreYears.map(String), selectedYear?.year, year].filter(
          (y): y is string => !!y,
        ),
      ),
    ].sort((a, b) => b.localeCompare(a))

    if (!year || error) {
      return (
        <Layout>
          <div>{ERROR_TEXT}</div>
        </Layout>
      )
    }

    return (
      <Layout>
        <div className="flex w-full flex-col items-center gap-8">
          <div ref={picture} className="w-full max-w-md">
            <Image
              src={ranglisteImage}
              alt="Rangliste"
              priority
              className="h-auto w-full"
            />
          </div>
          <DriftingWichtel picture={picture} />
          {years.length > 1 ? (
            // Our own arrow: the browser's sits too close to the edge.
            <div className="relative">
              <select
                aria-label="Jahr"
                value={year}
                onChange={(e) => setChosenYear(e.target.value)}
                className="card-white cursor-pointer appearance-none rounded-full bg-pine-950/60 py-1 pr-12 pl-5 font-display text-2xl text-white [text-shadow:0_0_8px_rgb(200_225_255/0.55)] focus:ring-4 focus:ring-white/50 focus:outline-hidden"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-pine-900 font-body">
                    {y}
                  </option>
                ))}
              </select>
              <svg
                viewBox="0 0 12 8"
                aria-hidden
                className="pointer-events-none absolute top-1/2 right-5 h-2 w-3 -translate-y-1/2 text-white"
              >
                <path
                  d="M1 1.5 L6 6.5 L11 1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : (
            <div className="font-display text-3xl">{year}</div>
          )}
          {loading || !entries ? (
            <Loading />
          ) : (
            <Board
              entries={entries}
              myId={player?.id ?? null}
              unlocked={
                year === currentYear
                  ? unlockedNow
                  : Number(year) < Number(currentYear)
                    ? 24
                    : 0
              }
            />
          )}
        </div>
      </Layout>
    )
  },
)

export interface BoardProps {
  /** Ranked best first, as the database returns them. */
  entries: LeaderboardEntry[]
  myId: string | null
  /** Doors open so far in that year. */
  unlocked: number
}

/** What everyone did together, then the list with everyone's tree. */
export function Board(props: BoardProps) {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-8">
      <Together {...props} />
      <List {...props} />
    </div>
  )
}

const MEDALS = [
  { fill: "#e9c46a", shine: "#fff3c4", name: "Gold" },
  { fill: "#c9ced6", shine: "#ffffff", name: "Silber" },
  { fill: "#cd7f45", shine: "#f6c49c", name: "Bronze" },
]

/** A Christmas bauble in gold, silver or bronze for places 1 to 3. */
function Medal({ rank, size = 36 }: { rank: number; size?: number }) {
  const medal = MEDALS[rank - 1]
  if (!medal) return null
  return (
    <svg
      viewBox="0 0 40 46"
      width={size}
      height={size * 1.15}
      role="img"
      aria-label={`Platz ${rank} (${medal.name})`}
    >
      <rect x="15" y="2" width="10" height="7" rx="1.5" fill="#8a6a2a" />
      <circle cx="20" cy="27" r="17" fill={medal.fill} />
      <circle cx="13" cy="20" r="5" fill={medal.shine} opacity="0.7" />
      <text
        x="20"
        y="33"
        textAnchor="middle"
        fontSize="16"
        fill="#3b2a1a"
        className="font-door"
      >
        {rank}
      </text>
    </svg>
  )
}

function List({ entries, myId }: BoardProps) {
  const places = ranks(entries)
  return (
    <ol className="flex w-full flex-col gap-3">
      {entries.map((entry, i) => {
        const isMe = !!myId && entry.player_id === myId
        return (
          <li
            key={entry.player_id ?? `alt-${i}`}
            className={clsx(
              "flex items-center gap-3 card py-2 pr-2 pl-3",
              isMe ? "bg-gold/15 card-glow" : "bg-black/40",
            )}
          >
            <div className="flex w-10 shrink-0 justify-center">
              {places[i] <= 3 && entry.score > 0 ? (
                <Medal rank={places[i]} />
              ) : (
                <span className="font-door text-2xl">{places[i]}.</span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="truncate text-lg font-semibold text-white">
                {entry.name}
                {isMe && <span className="ml-2 text-candle">(Du)</span>}
              </div>
              <div className="text-base text-[#9be3ad]">
                Türchen geöffnet: {entry.doors}
              </div>
              <div className="text-base">Punkte: {entry.score}</div>
            </div>
            <ChristmasTree
              ornaments={entry.doors}
              className="w-16 shrink-0 sm:w-20"
            />
          </li>
        )
      })}
    </ol>
  )
}

function Together({ entries, unlocked }: BoardProps) {
  const playing = entries.filter((e) => e.doors > 0 || e.score > 0)
  const totalDoors = playing.reduce((sum, e) => sum + e.doors, 0)
  const totalPoints = playing.reduce((sum, e) => sum + e.score, 0)
  const possible = playing.length * unlocked

  return (
    <section className="card-white w-full card px-5 py-5 text-center">
      <h2 className="text-2xl">Gemeinsam geschafft</h2>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat
          value={playing.length}
          label={playing.length === 1 ? "Mitspieler" : "Mitspielende"}
        />
        <Stat value={totalDoors} label="Türchen geöffnet" />
        <Stat value={totalPoints} label="Punkte gesammelt" />
      </div>
      {possible > 0 && (
        <div className="mt-4">
          <LightGarland done={totalDoors} total={possible} />
        </div>
      )}
    </section>
  )
}

const BULBS_PER_SWAG = 10
const SWAGS = 2
const LIGHT_COLORS = ["#ffd166", "#ff7b6b", "#9be3ad", "#ffb37a", "#a8d8ff"]

/**
 * A fir garland with fairy lights for what the family has done together:
 * as many lights are on as doors are open, the rest wait in the dark.
 */
function LightGarland({ done, total }: { done: number; total: number }) {
  const count = BULBS_PER_SWAG * SWAGS
  const lit = Math.round((Math.min(done, total) / total) * count)
  // Two swags hanging between three points.
  const swags = [
    { from: [6, 12], dip: [83, 44], to: [160, 12] },
    { from: [160, 12], dip: [237, 44], to: [314, 12] },
  ]
  const point = (swag: (typeof swags)[number], t: number): [number, number] => {
    const { from, dip, to } = swag
    // The control point that makes the curve pass through the dip.
    const cy = dip[1] * 2 - (from[1] + to[1]) / 2
    const x = (1 - t) ** 2 * from[0] + 2 * (1 - t) * t * dip[0] + t ** 2 * to[0]
    const y = (1 - t) ** 2 * from[1] + 2 * (1 - t) * t * cy + t ** 2 * to[1]
    return [x, y]
  }
  const garland = swags
    .map(
      ({ from, dip, to }, i) =>
        `${i === 0 ? `M${from[0]} ${from[1]}` : ""} Q${dip[0]} ${dip[1] * 2 - (from[1] + to[1]) / 2} ${to[0]} ${to[1]}`,
    )
    .join(" ")

  return (
    <svg
      viewBox="0 0 320 64"
      className="w-full"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      aria-label="Gemeinsam geöffnete Türchen"
    >
      <defs>
        <filter id="garland-soft" x="-5%" y="-30%" width="110%" height="160%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>
      {/* The fir garland, with a few berries where it hangs. */}
      <g filter="url(#garland-soft)">
        <path
          d={garland}
          stroke="#24502a"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={garland}
          stroke="#3f8a4a"
          strokeWidth="8"
          fill="none"
          strokeDasharray="1.5 3"
          strokeLinecap="round"
        />
        <path
          d={garland}
          stroke="#5fae62"
          strokeWidth="4"
          fill="none"
          strokeDasharray="1 4"
          strokeLinecap="round"
          opacity="0.7"
        />
      </g>
      {[6, 160, 314].map((x) => (
        <g key={x}>
          <circle cx={x - 3} cy="11" r="3" fill="#c62f2f" />
          <circle cx={x + 3} cy="13" r="3" fill="#a52424" />
        </g>
      ))}
      {swags.flatMap((swag, s) =>
        Array.from({ length: BULBS_PER_SWAG }, (_, i) => {
          const index = s * BULBS_PER_SWAG + i
          const [x, y] = point(swag, (i + 0.5) / BULBS_PER_SWAG)
          const on = index < lit
          const color = LIGHT_COLORS[index % LIGHT_COLORS.length]
          return (
            <g key={index} transform={`rotate(${i % 2 ? 8 : -8} ${x} ${y})`}>
              <rect
                x={x - 2.5}
                y={y + 2}
                width="5"
                height="4"
                rx="1"
                fill="#2b2b2b"
              />
              <ellipse
                cx={x}
                cy={y + 11}
                rx="4.5"
                ry="6.5"
                fill={on ? color : "#3f4a44"}
                opacity={on ? 1 : 0.75}
                style={
                  on ? { filter: `drop-shadow(0 0 4px ${color})` } : undefined
                }
              />
            </g>
          )
        }),
      )}
    </svg>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-door text-3xl text-candle sm:text-4xl">
        {value}
      </span>
      <span className="text-sm leading-tight text-candle/85 sm:text-base sm:leading-6">
        {label}
      </span>
    </div>
  )
}

export default Rangliste
