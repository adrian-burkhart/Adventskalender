"use client"

import { useLeaderboard, usePlayer, type LeaderboardEntry } from "@/lib/hooks"
import Layout from "@/components/layout"
import { useSelectedYear } from "@/lib/context"
import ranglisteImage from "../../public/images/rangliste.webp"
import { memo, useState } from "react"
import Image from "next/image"
import clsx from "clsx"
import { ERROR_TEXT } from "@/lib/texts"
import { ranks } from "@/lib/ranking"
import { useDesign, type DesignChoice } from "@/lib/design-variants"
import Loading from "./loading"

export type RanglisteVariant = DesignChoice<"rangliste">

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
          <Image
            src={ranglisteImage}
            alt="Rangliste"
            className="h-auto w-full max-w-md"
          />
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
  /** Overrides the chosen design (for /vorschau). */
  variant?: RanglisteVariant
}

export function Board({ variant, ...props }: BoardProps) {
  const chosen = useDesign("rangliste")
  return (variant ?? chosen) === "klassisch" ? (
    <ClassicBoard {...props} />
  ) : (
    <FamilyBoard {...props} />
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
        className="font-display"
      >
        {rank}
      </text>
    </svg>
  )
}

// --- Version 1: the familiar list, improved ----------------------------------

function ClassicBoard({ entries, myId }: Omit<BoardProps, "variant">) {
  const places = ranks(entries)
  return (
    <ol className="flex w-full max-w-md flex-col gap-3">
      {entries.map((entry, i) => {
        const isMe = !!myId && entry.player_id === myId
        return (
          <li
            key={entry.player_id ?? `alt-${i}`}
            className={clsx(
              "flex items-center gap-3 rounded-2xl border-2 px-3 py-2 shadow-md",
              isMe
                ? "border-gold bg-gold/15"
                : "border-transparent bg-black/40",
            )}
          >
            <div className="flex w-10 shrink-0 justify-center">
              {places[i] <= 3 && entry.score > 0 ? (
                <Medal rank={places[i]} />
              ) : (
                <span className="font-display text-2xl">{places[i]}.</span>
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
          </li>
        )
      })}
    </ol>
  )
}

// --- Version 2: the family's Rangliste ---------------------------------------

function FamilyBoard({ entries, myId, unlocked }: Omit<BoardProps, "variant">) {
  const places = ranks(entries)
  const playing = entries.filter((e) => e.doors > 0 || e.score > 0)
  const waiting = entries.filter((e) => e.doors === 0 && e.score === 0)
  const totalDoors = playing.reduce((sum, e) => sum + e.doors, 0)
  const totalPoints = playing.reduce((sum, e) => sum + e.score, 0)
  const possible = playing.length * unlocked

  const podium = [1, 2, 3].map((place) =>
    entries.filter((e, i) => places[i] === place && e.score > 0),
  )
  const rest = entries
    .map((entry, i) => ({ entry, place: places[i] }))
    .filter(
      ({ entry, place }) =>
        (place > 3 || entry.score === 0) &&
        (entry.doors > 0 || entry.score > 0),
    )

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-8">
      {/* What everyone has done together. */}
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

      {/* The podium: the middle step is the highest. */}
      {podium[0].length > 0 && (
        <section className="w-full" aria-label="Die ersten drei Plätze">
          <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
            {[1, 0, 2].map((index) => (
              <Step
                key={index}
                place={index + 1}
                entries={podium[index]}
                myId={myId}
                height={["h-32", "h-24", "h-16"][index]}
              />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <ol className="flex w-full flex-col gap-2">
          {rest.map(({ entry, place }, i) => {
            const isMe = !!myId && entry.player_id === myId
            return (
              <li
                key={entry.player_id ?? `alt-${i}`}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl border-2 px-4 py-2",
                  isMe
                    ? "border-gold bg-gold/15"
                    : "border-transparent bg-black/35",
                )}
              >
                <span className="w-8 shrink-0 font-display text-2xl">
                  {place}.
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg text-white">
                    {entry.name}
                    {isMe && <span className="ml-2 text-candle">(Du)</span>}
                  </div>
                  <DoorBar doors={entry.doors} unlocked={unlocked} />
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl leading-none">
                    {entry.score}
                  </div>
                  <div className="text-sm text-candle/80">Punkte</div>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {waiting.length > 0 && (
        <section className="card w-full px-5 py-4 text-center">
          <h2 className="text-xl">Noch nicht dabei</h2>
          <p className="mt-1 text-base text-candle/85">
            Vielleicht magst du sie ans Türchen erinnern?
          </p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2">
            {waiting.map((entry, i) => (
              <li
                key={entry.player_id ?? `wait-${i}`}
                className="rounded-full border border-gold/40 bg-black/30 px-3 py-1 text-base"
              >
                {entry.name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-display text-3xl text-candle sm:text-4xl">
        {value}
      </span>
      <span className="text-sm leading-tight text-candle/85 sm:text-base">
        {label}
      </span>
    </div>
  )
}

/** Doors opened, as a little bar under the name. */
function DoorBar({ doors, unlocked }: { doors: number; unlocked: number }) {
  const max = Math.max(unlocked, doors, 1)
  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full bg-[#9be3ad]"
          style={{ width: `${(doors / max) * 100}%` }}
        />
      </div>
      <span className="shrink-0 text-sm text-[#9be3ad]">{doors} Türchen</span>
    </div>
  )
}

function Step({
  place,
  entries,
  myId,
  height,
}: {
  place: number
  entries: LeaderboardEntry[]
  myId: string | null
  height: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {entries.length > 0 && (
        <>
          <Medal rank={place} size={place === 1 ? 48 : 38} />
          <ul className="flex flex-col gap-0.5">
            {entries.map((entry, i) => (
              <li
                key={entry.player_id ?? `p-${i}`}
                className={clsx(
                  "break-words text-base font-semibold leading-tight sm:text-lg",
                  myId && entry.player_id === myId
                    ? "text-candle underline decoration-gold underline-offset-4"
                    : "text-white",
                )}
              >
                {entry.name}
              </li>
            ))}
          </ul>
          <span className="text-base">{entries[0].score} Punkte</span>
        </>
      )}
      <div
        className={clsx(
          "w-full rounded-t-xl border-2 border-b-0 border-gold/50 bg-gradient-to-b from-berry to-berry-dark shadow-lg",
          height,
          // Empty when players share the place above (1, 2, 2, 4).
          entries.length === 0 && "opacity-40",
        )}
      >
        <span className="mt-2 block font-display text-3xl text-candle-soft">
          {place}
        </span>
      </div>
    </div>
  )
}

export default Rangliste
