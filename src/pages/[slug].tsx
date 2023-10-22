import { useRouter } from "next/router"
import { GetServerSidePropsContext } from "next"
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import Layout from "@/components/layout"
import { memo } from "react"
import { useYears } from "@/lib/hooks"

const Page = memo(() => {
  const router = useRouter()
  const { years, loading, error } = useYears()

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{"Error"}</div>
  }

  const year = router.query.slug?.slice(0, 4)
  const doorNumber = router.query.slug?.slice(4)

  const questions = years
    ?.find((y) => y.year === year)
    ?.questions.find((q) => q.door_number === Number(doorNumber))

  return (
    <Layout>
      <main>
        <p>year: {year}</p>
        <p>number: {doorNumber}</p>
        <p>question: {questions?.question}</p>
        <p>answer: {questions?.answer}</p>
        <p>
          answer options:{" "}
          {questions?.answer_options.map((option, i) => (
            <p key={i}>{option}</p>
          ))}
        </p>
        <p>
          {/* {questions && (
            <Image src={questions.image} alt={""} width={160} height={160} />
          )} */}
        </p>
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
