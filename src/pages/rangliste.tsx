import { usePlayers } from "@/lib/hooks"
import { GetServerSidePropsContext } from "next"
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs"
import Layout from "@/components/layout"
import { useSelectedYear } from "@/lib/context"
import ranglisteImage from "../../public/images/rangliste.webp"
import { memo } from "react"
import { dateTimeFromIso } from "@/lib/dateTime"
import { reverse, sortBy } from "lodash"
import Image from "next/image"

const Rangliste = memo(() => {
  const { players, error: fetchError, loading: fetchLoading } = usePlayers()

  const { selectedYear } = useSelectedYear()!

  if (fetchLoading) {
    return <div>Loading...</div>
  }

  if (fetchError) {
    return <div>{`Error: ${fetchError!.message}`}</div>
  }

  return (
    <Layout>
      <main>
        {selectedYear === null ? (
          <div className="text-lg">Rangliste</div>
        ) : (
          <div className="flex flex-col items-center gap-10">
            <Image src={ranglisteImage} alt="" />
            <div className="text-2xl">{selectedYear?.year}</div>
            <div className="flex flex-col items-center justify-center gap-4">
              {players &&
                sortBy(players, [
                  (p) =>
                    -(
                      p.scores.find((score) =>
                        dateTimeFromIso(score.year).hasSame(
                          dateTimeFromIso(selectedYear.year),
                          "year",
                        ),
                      )?.score ?? 0
                    ),
                  (p) => p.name.toLowerCase(),
                ]).map((player, i) => {
                  const playerScore = player.scores.find((score) =>
                    dateTimeFromIso(score.year).hasSame(
                      dateTimeFromIso(selectedYear.year),
                      "year",
                    ),
                  )

                  return (
                    <div key={i} className="flex gap-4">
                      <div className="text-xl">{i + 1}.</div>
                      <div
                        className="flex w-64 flex-col rounded-md bg-black bg-opacity-40 px-2 py-1 shadow-md"
                        key={player.id}
                      >
                        <div>Name: {player.name}</div>
                        <div>Punkte: {playerScore?.score}</div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </main>
    </Layout>
  )
})

export default Rangliste

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
