"use client"

import { useLeaderboard, type LeaderboardEntry } from "@/lib/hooks"
import Layout from "@/components/layout"
import { useSelectedYear } from "@/lib/context"
import ranglisteImage from "../../public/images/rangliste.webp"
import { memo, useState } from "react"
import Image from "next/image"
import { TreeEvergreen } from "@phosphor-icons/react"
import { ERROR_TEXT } from "@/lib/texts"
import Loading from "./loading"

const Rangliste = memo(
  ({
    initial,
    scoreYears,
  }: {
    /** The current year's leaderboard, rendered on the server. */
    initial?: { year: string; entries: LeaderboardEntry[] }
    scoreYears: number[]
  }) => {
    const { selectedYear } = useSelectedYear()
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
          <main>{ERROR_TEXT}</main>
        </Layout>
      )
    }

    // The database returns the players already ranked.
    const highestScore = entries?.[0]?.score ?? 0

    return (
      <Layout>
        <main>
          <div className="flex flex-col items-center gap-10">
            <Image src={ranglisteImage} alt="" />
            {years.length > 1 ? (
              <select
                aria-label="Jahr"
                value={year}
                onChange={(e) => setChosenYear(e.target.value)}
                className="cursor-pointer rounded-md border border-yellow-200 bg-transparent px-2 py-1 text-2xl text-yellow-200 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="bg-green-950">
                    {y}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-2xl">{year}</div>
            )}
            {loading || !entries ? (
              <Loading />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4">
                {entries.map((entry, i) => (
                  <div
                    key={entry.player_id ?? `alt-${i}`}
                    className="flex gap-4"
                  >
                    <div className="w-6 text-xl">{i + 1}.</div>
                    <div className="flex w-64 flex-col rounded-md bg-black bg-opacity-40 px-2 py-1 shadow-md">
                      <div className="flex justify-between gap-2">
                        <div>
                          <div className="text-white">{entry.name}</div>
                          <div className="text-green-700">
                            Türchen geöffnet: {entry.doors}
                          </div>
                          <div>Punkte: {entry.score}</div>
                        </div>
                        {highestScore > 0 && entry.score === highestScore && (
                          <div className="flex items-center justify-center px-2">
                            <TreeEvergreen size={32} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </Layout>
    )
  },
)

export default Rangliste
