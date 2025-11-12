import { usePlayers } from "@/lib/hooks"
import { GetServerSidePropsContext } from "next"
import { createClient } from "@/utils/supabase/server"
import Layout from "@/components/layout"
import { useSelectedYear } from "@/lib/context"
import ranglisteImage from "../../public/images/rangliste.webp"
import { memo } from "react"
import { dateTimeFromIso } from "@/lib/dateTime"
import { filter, maxBy, sortBy } from "lodash"
import Image from "next/image"
import { TreeEvergreen } from "phosphor-react"

const Rangliste = memo(() => {
  const { players, error: fetchError, loading: fetchLoading } = usePlayers()

  const {selectedYear}= useSelectedYear()
console.log(players)
  if (fetchLoading) {
    return <div>Loading...</div>
  }

  if (fetchError) {
    return <div>{`Error: ${fetchError!.message}`}</div>
  }

  if (!selectedYear) {
    return <div>Kein Jahr ausgewählt</div>
  }

  const highestScore = maxBy(
    players,
    (p) =>
      p.scores.find((score) =>
        dateTimeFromIso(score.year).hasSame(
          dateTimeFromIso(selectedYear.year),
          "year",
        ),
      )?.score ?? 0,
  )?.scores.find((score) =>
    dateTimeFromIso(score.year).hasSame(
      dateTimeFromIso(selectedYear.year),
      "year",
    ),
  )?.score

  const sortedPlayers = sortBy(players, [
    (p) =>
      -(
        p.scores.find((score) =>
          dateTimeFromIso(score.year).hasSame(
            dateTimeFromIso(selectedYear.year),
            "year",
          ),
        )?.score ?? 0
      ),
    (p) => p.doors_opened && -p.doors_opened.length,
    (p) => p.name.toLowerCase(),
  ])

  return (
    <Layout>
      <main>
        <div className="flex flex-col items-center gap-10">
          <Image src={ranglisteImage} alt="" />
          <div className="text-2xl">{selectedYear?.year}</div>
          <div className="flex flex-col items-center justify-center gap-4">
            {players &&
              sortedPlayers.map((player, i) => {
                const playerScore = player.scores.find((score) =>
                  dateTimeFromIso(score.year).hasSame(
                    dateTimeFromIso(selectedYear.year),
                    "year",
                  ),
                )?.score
                const doorsOpened = filter(
                  player.doors_opened,
                  (d) => dateTimeFromIso(d.year).hasSame(
                    dateTimeFromIso(selectedYear.year),
                    "year",
                  )&&d.isAnswered,
                ).length

                return (
                  <div key={i} className="flex gap-4">
                    <div className="w-6 text-xl">{i + 1}.</div>
                    <div
                      className="flex w-64 flex-col rounded-md bg-black bg-opacity-40 px-2 py-1 shadow-md"
                      key={player.id}
                    >
                      <div className="flex justify-between gap-2">
                        <div>
                          <div className="text-white">{player.name}</div>
                          <div className="text-green-700">
                            Türchen geöffnet: {doorsOpened}
                          </div>
                          <div>Punkte: {playerScore ??0}</div>
                        </div>
                        {playerScore === highestScore && (
                          <div className="flex items-center justify-center px-2">
                            <TreeEvergreen size={32} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </main>
    </Layout>
  )
})

export default Rangliste

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
