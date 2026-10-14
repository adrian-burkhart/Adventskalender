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
            <select
              aria-label="Jahr"
              value={year}
              onChange={(e) => setChosenYear(e.target.value)}
              className="cursor-pointer rounded-full border-2 border-gold/60 bg-pine-950/60 px-4 py-1 font-display text-2xl text-candle focus:outline-none focus:ring-4 focus:ring-gold/50"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-pine-900 font-body">
                  {y}
                </option>
              ))}
            </select>
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
              "flex items-center gap-3 rounded-2xl border-2 py-2 pl-3 pr-2 shadow-md",
              isMe
                ? "border-gold bg-gold/15"
                : "border-transparent bg-black/40",
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
    <section className="card w-full px-5 py-5 text-center">
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
        <div className="mt-5">
          <div
            className="h-4 w-full overflow-hidden rounded-full bg-black/40"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={possible}
            aria-valuenow={totalDoors}
            aria-label="Gemeinsam geöffnete Türchen"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-berry via-gold to-candle"
              style={{
                width: `${Math.min(100, (totalDoors / possible) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-base text-candle/85">
            {totalDoors} von {possible} möglichen Türchen sind schon offen.
          </p>
        </div>
      )}
    </section>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-door text-3xl text-candle sm:text-4xl">
        {value}
      </span>
      <span className="text-sm leading-tight text-candle/85 sm:text-base">
        {label}
      </span>
    </div>
  )
}

export default Rangliste
