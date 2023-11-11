import { useRouter } from "next/router"
import { GetServerSidePropsContext } from "next"
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import Layout from "@/components/layout"
import { memo } from "react"
import { usePlayer, useYears } from "@/lib/hooks"
import QuestionForm from "@/components/question-form"
import { useSelectedYear } from "@/lib/context"

const Page = memo(() => {
  const router = useRouter()
  const { player, loading: playerLoading, error: playerError } = usePlayer()
  const { selectedYear } = useSelectedYear()!

  const { years, loading, error } = useYears()
  if (loading || playerLoading) {
    return <div>Loading...</div>
  }

  if (error || playerError || !player || !selectedYear) {
    return <div>{"Error"}</div>
  }

  const year = router.query.slug?.slice(0, 4)
  const doorNumber = router.query.slug?.slice(4)

  const question = years
    ?.find((y) => y.year === year)
    ?.questions.find((q) => q.door_number === Number(doorNumber))

  return (
    <Layout>
      <main className="flex h-full items-center justify-center">
        {question ? (
          <QuestionForm
            selectedYear={selectedYear}
            player={player}
            doorNumber={Number(doorNumber)}
            question={question}
          />
        ) : (
          <div>Frage fehlt noch. Sorry ;(</div>
        )}
      </main>
    </Layout>
  )
})

export default Page

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
