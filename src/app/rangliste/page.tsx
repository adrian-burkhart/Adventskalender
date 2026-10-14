"use client"

import { useLeaderboard } from "@/lib/hooks"
import Layout from "@/components/layout"
import { useSelectedYear } from "@/lib/context"
import ranglisteImage from "../../../public/images/rangliste.webp"
import { memo } from "react"
import Image from "next/image"
import { TreeEvergreen } from "@phosphor-icons/react"
import { ERROR_TEXT, LOADING_TEXT } from "@/lib/texts"

const Rangliste = memo(() => {
  const { selectedYear } = useSelectedYear()
  const { entries, error, loading } = useLeaderboard(selectedYear?.year ?? null)

  if (!selectedYear) {
    return <div>Kein Jahr ausgewählt</div>
  }

  if (error) {
    return <div>{ERROR_TEXT}</div>
  }

  if (loading || !entries) {
    return <div>{LOADING_TEXT}</div>
  }

  // The database returns the players already ranked.
  const highestScore = entries[0]?.score ?? 0

  return (
    <Layout>
      <main>
        <div className="flex flex-col items-center gap-10">
          <Image src={ranglisteImage} alt="" />
          <div className="text-2xl">{selectedYear.year}</div>
          <div className="flex flex-col items-center justify-center gap-4">
            {entries.map((entry, i) => (
              <div key={entry.player_id} className="flex gap-4">
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
        </div>
      </main>
    </Layout>
  )
})

export default Rangliste
