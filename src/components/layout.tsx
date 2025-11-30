import { ReactNode, memo } from "react"
import Navbar from "./navbar"
import { usePlayer, useYears } from "@/lib/hooks"
import { useSelectedYear } from "@/lib/context"
import { dateTimeFromIso } from "@/lib/dateTime"
import Head from "next/head"
import Footer from "./footer"
import { FeatureFlag, useFeatureFlag } from "@/lib/feature-flags"

const Layout = memo(({ children }: { children: ReactNode }) => {
  const { years } = useYears()
  const enabledTestMode = useFeatureFlag(FeatureFlag.ENABLE_TEST_MODE)

  const { selectedYear, setSelectedYear } = useSelectedYear()
  const { player } = usePlayer()

  const currentScore = selectedYear
    ? player?.scores.find((score) =>
      dateTimeFromIso(score.year).hasSame(
        dateTimeFromIso(selectedYear.year),
        "year",
      ),
    )
    : null

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = years!.find((y) => y.year === e.target.value)
    if (year) setSelectedYear(year)
  }

  return (
    <>
      <Head>
        <title>Adventskalender der Familie Haas</title>
      </Head>
      <Navbar />
      {enabledTestMode && years && (
        <select
          onChange={handleOnChange}
          value={selectedYear?.year}
          className="bg-red-500"
        >
          {years?.map((year) => <option key={year.year}>{year.year}</option>)}
        </select>
      )}
      {currentScore && <div>Deine Punkte: {currentScore.score}</div>}
      <main className="flex flex-col items-center justify-center pt-16">
        {children}
      </main>
      <Footer />
    </>
  )
})

export default Layout
