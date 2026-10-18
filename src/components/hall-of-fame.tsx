"use client"

import clsx from "clsx"
import { memo, useState } from "react"
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

const names = (entry: HallEntry) => entry.winners.join(" & ")

/** The winners of all past seasons, engraved below the golden star. */
const HallOfFame = memo(
  ({
    entries,
    withExamples,
  }: {
    entries: HallEntry[]
    withExamples: boolean
  }) => {
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
            <h1 className="text-4xl sm:text-5xl">Hall of Fame</h1>
            <p className="mt-2 text-lg">
              Die Gewinnerinnen und Gewinner der vergangenen Jahre
            </p>
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
          ) : (
            <GoldenStar entries={shown} />
          )}
        </div>
      </Layout>
    )
  },
)

// The ten facets of the star, lit from the upper left.
const FACETS = [
  ["M120 118 L120 10 L145.9 82.4 Z", "#f2c94c"],
  ["M120 118 L145.9 82.4 L222.7 84.6 Z", "#e9b949"],
  ["M120 118 L222.7 84.6 L161.8 131.6 Z", "#c99230"],
  ["M120 118 L161.8 131.6 L183.5 205.4 Z", "#b8862b"],
  ["M120 118 L183.5 205.4 L120 162 Z", "#9a6a1c"],
  ["M120 118 L120 162 L56.5 205.4 Z", "#c08a2a"],
  ["M120 118 L56.5 205.4 L78.2 131.6 Z", "#a87520"],
  ["M120 118 L78.2 131.6 L17.3 84.6 Z", "#e0aa3e"],
  ["M120 118 L17.3 84.6 L94.1 82.4 Z", "#f7d774"],
  ["M120 118 L94.1 82.4 L120 10 Z", "#fff2b8"],
]

/**
 * A golden star above a wooden plinth. Every winner gets a brass plate
 * engraved with year and name; the newest sits on top and shines.
 */
function GoldenStar({ entries }: { entries: HallEntry[] }) {
  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <svg
        viewBox="0 0 240 230"
        className="mb-4 w-56 drop-shadow-[0_0_30px_rgb(250_204_21/0.45)] sm:w-64"
        aria-hidden
      >
        {FACETS.map(([d, fill]) => (
          <path key={d} d={d} fill={fill} />
        ))}
        <path
          d="M120 10 L145.9 82.4 L222.7 84.6 L161.8 131.6 L183.5 205.4 L120 162 L56.5 205.4 L78.2 131.6 L17.3 84.6 L94.1 82.4 Z"
          fill="none"
          stroke="#8a5a12"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>

      {/* The plinth with its plates. */}
      <div className="w-full rounded-t-md rounded-b-2xl border-t-4 border-[#5a3820] bg-linear-to-b from-[#7a4a26] to-[#4a2c16] px-5 pt-5 pb-6 shadow-2xl">
        <ol className="flex flex-col gap-3">
          {entries.map((entry, i) => (
            <li
              key={entry.year}
              className={clsx(
                "rounded-md border border-[#7a5a1e] bg-linear-to-b from-[#f3d98a] via-[#d9b25a] to-[#b38a36] px-4 py-2 text-center text-[#3b2a10] shadow-[inset_0_1px_0_rgb(255_255_255/0.6),0_2px_4px_rgb(0_0_0/0.4)]",
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

export default HallOfFame
