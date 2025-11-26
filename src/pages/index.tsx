import { GetServerSidePropsContext } from "next"
import { createClient } from "@/utils/supabase/server"
import Layout from "@/components/layout"
import Calendar from "@/components/calendar"
import { memo, useEffect, useState } from "react"
import { usePlayer } from "@/lib/hooks"
import Image from "next/image"
import title from "../../public/images/title.webp"
import { DateTime, Duration } from "luxon"
import { useSelectedYear } from "@/lib/context"

const Home = memo(() => {
  const { player, loading: isPlayerLoading } = usePlayer()
  const {selectedYear }= useSelectedYear()
  const [countdown, setCountdown] = useState<Duration | null>(null)
  const calendarStarts = DateTime.fromISO(
    `${selectedYear?.year ?? "2025"}-12-01T00:00:00.000Z`,
  )

  const calendarHasStarted = calendarStarts.diffNow().milliseconds < 0

  const updateCountdown = () => {
    const duration = Duration.fromMillis(
      calendarStarts.diffNow().milliseconds,
    ).shiftTo("days", "hours", "minutes")
    setCountdown(duration)
  }

  useEffect(() => {
    updateCountdown()

    const interval = setInterval(() => {
      updateCountdown()
    }, 60000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear?.year])

  if (isPlayerLoading) {
    return <div>Loading...</div>
  }

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
                  Bis dahin sind es noch:{" "}
                  {countdown
                    ? `${countdown.days} Tage, ${
                        countdown.hours
                      } Stunden und ${Math.round(countdown.minutes)} Minuten`
                    : ""}
                </div>
              </div>
            )} 
          </div>
          {player && <Calendar player={player} />}
        </div>
      </main>
    </Layout>
  )
})

export default Home

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createClient(ctx)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session)
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    }

  return {
    props: {
      user: session.user,
    },
  }
}
