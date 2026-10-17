"use client"

import Layout from "@/components/layout"
import Calendar from "@/components/calendar"
import YearSelect from "@/components/year-select"
import { memo, useEffect, useState } from "react"
import { usePlayer } from "@/lib/hooks"
import Image from "next/image"
import title from "../../public/images/title.webp"
import { Duration } from "luxon"
import { useSelectedYear } from "@/lib/context"
import { doorUnlocksAt } from "@/lib/doors"
import { greeting } from "@/lib/greeting"
import type { InitialDoors } from "@/lib/hooks"

/** "1 Tag", "2 Tage", "0 Tage". */
function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

const Home = memo(
  ({
    initialDoors,
    renderedAt,
  }: {
    initialDoors?: InitialDoors
    /** The server's clock, so the first render matches the HTML. */
    renderedAt: number
  }) => {
    const { player } = usePlayer()
    const { years, currentYear, selectedYear, setSelectedYear } =
      useSelectedYear()
    // Years with questions to look back on, and the current one.
    const choices = years
      .filter((y) => y.questionCount > 0 || y.year === currentYear)
      .map((y) => y.year)
      .sort((a, b) => b.localeCompare(a))
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
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <Image
            alt="Adventskalender der Familie Haas"
            src={title}
            priority
            className="h-auto w-full max-w-2xl"
          />
          {player && (
            <Calendar
              initialDoors={initialDoors}
              greeting={
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  {player.name && (
                    // By the player's own clock. The server renders with
                    // its time; right after loading it switches to the
                    // device's, so the first render may differ.
                    <h1
                      className="text-3xl sm:text-4xl"
                      suppressHydrationWarning
                    >
                      {greeting(player.name, new Date(now))}
                    </h1>
                  )}
                  {!calendarHasStarted && (
                    <div className="flex max-w-md flex-col items-center justify-center gap-2 px-6 text-center">
                      <div>Schön, dass du schon hier bist!</div>
                      <div>Die erste Tür kannst du am 1. Dezember öffnen.</div>
                      <div>
                        Bis dahin sind es noch:{" "}
                        {plural(countdown.days, "Tag", "Tage")},{" "}
                        {plural(countdown.hours, "Stunde", "Stunden")} und{" "}
                        {plural(
                          Math.floor(countdown.minutes),
                          "Minute",
                          "Minuten",
                        )}
                      </div>
                    </div>
                  )}
                </div>
              }
            />
          )}
          {player && selectedYear && choices.length > 1 && (
            // Below all doors: earlier years are only for a look back.
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-center">
              <span className="text-lg">
                Hier kannst du nochmal die Türen aus den letzten Jahren sehen
              </span>
              <YearSelect
                tone="gold"
                years={choices}
                value={selectedYear.year}
                onChange={(value) => {
                  const year = years.find((y) => y.year === value)
                  if (year) setSelectedYear(year)
                }}
              />
            </div>
          )}
        </div>
      </Layout>
    )
  },
)

export default Home
