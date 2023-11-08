import { GetServerSidePropsContext } from "next"
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import Layout from "@/components/layout"
import Calendar from "@/components/calendar"
import { memo } from "react"
import { usePlayer } from "@/lib/hooks"

const Home = memo(() => {
  const { player } = usePlayer()

  return (
    <Layout>
      <main>
        <div className="mt-24 flex flex-col items-center justify-center gap-4">
          <div className="text-2xl text-yellow-200">
            Adventskalender der Familie Haas
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
