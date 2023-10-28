import { useRouter } from "next/router"
import { GetServerSidePropsContext } from "next"
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import Layout from "@/components/layout"
import { memo } from "react"
import { useYears } from "@/lib/hooks"
import SoundButton from "@/components/sound-button"
import Image from "next/image"

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
        <div>year: {year}</div>
        <div>number: {doorNumber}</div>
        <div>question: {questions?.question}</div>
        <div>answer: {questions?.answer}</div>
        <div>
          answer options:{" "}
          {questions?.answer_options.map((option, i) => (
            <div key={i}>{option}</div>
          ))}
        </div>
        <div>
          {questions?.image && (
            <Image
              src={`${questions.image}?w=500`}
              alt="Bild für die Frage"
              width={500}
              height={500}
              // blurDataURL="data:..." automatically provided
              // placeholder="blur" // Optional blur-up while loading
            />
          )}
          <div className="flex flex-col gap-2">
            {questions?.audiofile_intro && (
              <SoundButton
                label={"Intro Musik"}
                url={questions.audiofile_intro.file}
              />
            )}
            {questions?.audiofile_question && (
              <SoundButton
                label={"Frage Musik"}
                url={questions.audiofile_question.file}
              />
            )}
            {questions?.audiofile_outro && (
              <SoundButton
                label={"Outro Musik"}
                url={questions.audiofile_outro.file}
              />
            )}
          </div>
        </div>
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
