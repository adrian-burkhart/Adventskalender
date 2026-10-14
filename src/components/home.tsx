"use client"

import Layout from "@/components/layout"
import Calendar from "@/components/calendar"
import { memo, useEffect, useState } from "react"
import { usePlayer } from "@/lib/hooks"
import Image from "next/image"
import title from "../../public/images/title.webp"
import { Duration } from "luxon"
import { useSelectedYear } from "@/lib/context"
import { doorUnlocksAt, type DoorState } from "@/lib/doors"

const Home = memo(
  ({
    initialDoors,
    renderedAt,
  }: {
    initialDoors?: { year: string; doors: DoorState[] }
    /** The server's clock, so the first render matches the HTML. */
    renderedAt: number
  }) => {
    const { player } = usePlayer()
    const { selectedYear } = useSelectedYear()
    const [now, setNow] = useState(renderedAt)

    useEffect(() => {
      const tick = () => setNow(Date.now())
      const timeout = setTimeout(tick, 0)
      const interval = setInterval(tick, 60000)
      return () => {
        clearTimeout(timeout)
        clearInterval(interval)
      }
    }, [])

    // The first door opens at midnight on 1 December, Berlin time.
    const calendarStarts = selectedYear
      ? doorUnlocksAt(Number(selectedYear.year), 1).getTime()
      : 0
    const calendarHasStarted = now >= calendarStarts
    const countdown = Duration.fromMillis(
      Math.max(0, calendarStarts - now),
    ).shiftTo("days", "hours", "minutes")

    return (
      <Layout>
        <main>
          <div className="mt-24 flex flex-col items-center justify-center gap-4">
            <div className="text-2xl text-yellow-200">
              <Image
                alt="Adventskalender der Familie Haas"
                src={title}
                priority
                className="h-full w-full"
              />
            </div>
            <div className="mb-4 flex flex-col items-center justify-center gap-2 text-center">
              {player && player.name && <div>Hallo {player.name}!</div>}
              {!calendarHasStarted && (
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <div>Schön, dass du schon hier bist!</div>
                  <div>Die erste Tür kannst du am 1. Dezember öffnen.</div>
                  <div>
                    Bis dahin sind es noch: {countdown.days} Tage,{" "}
                    {countdown.hours} Stunden und{" "}
                    {Math.floor(countdown.minutes)} Minuten
                  </div>
                </div>
              )}
            </div>
            {player && <Calendar initialDoors={initialDoors} />}
          </div>
        </main>
      </Layout>
    )
  },
)

export default Home
