import { GetServerSidePropsContext } from "next"
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import Layout from "@/components/layout"
import Calendar from "@/components/calendar"
import { memo } from "react"
import { usePlayer } from "@/lib/hooks"
import Image from "next/image"
import title from "../../public/images/title.webp"

const Home = memo(() => {
  const { player, loading: isPlayerLoading } = usePlayer()
  // const { selectedYear } = useSelectedYear()!
  // const [countdown, setCountdown] = useState<Duration | null>(null)
  // const calendarStarts = DateTime.fromISO(
  //   `${selectedYear?.year ?? "2023"}-12-01T00:00:00.000Z`,
  // )

  // const calendarHasStarted = calendarStarts.diffNow().milliseconds < 0

  // const updateCountdown = () => {
  //   const duration = Duration.fromMillis(
  //     calendarStarts.diffNow().milliseconds,
  //   ).shiftTo("days", "hours", "minutes")
  //   setCountdown(duration)
  // }

  // useEffect(() => {
  //   updateCountdown()

  //   const interval = setInterval(() => {
  //     updateCountdown()
  //   }, 60000)

  //   return () => clearInterval(interval)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedYear?.year])

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
            {player && player.name && (
              <div>Frohe Weihnachten, {player.name}!</div>
            )}
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <div>
                Wir hoffen, du hattest viel Spaß mit diesem Adventskalender. Wir
                wünschen dir ein schönes Fest.
              </div>
              <div>
                Wir würden uns sehr freuen, wenn du nächstes Jahr wieder dabei
                bist.
              </div>
              <br />
              <div>Jacky, Marcel und Adrian</div>
            </div>
          </div>
          {player && <Calendar player={player} />}
        </div>
      </main>
    </Layout>
  )
})

export default Home

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createPagesServerClient(ctx)
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
      initialSession: session,
      user: session.user,
    },
  }
}
