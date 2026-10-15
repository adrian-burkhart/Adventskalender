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

/** The winners of all past seasons, engraved on the challenge cup. */
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
            <Trophy entries={shown} />
          )}
        </div>
      </Layout>
    )
  },
)

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

export default HallOfFame
