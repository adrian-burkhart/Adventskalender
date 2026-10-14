"use client"

import { ReactNode, memo } from "react"
import Navbar from "./navbar"
import { useMyScores, useYears } from "@/lib/hooks"
import { useSelectedYear } from "@/lib/context"
import Footer from "./footer"
import { FeatureFlag, useFeatureFlag } from "@/lib/feature-flags"

const Layout = memo(({ children }: { children: ReactNode }) => {
  const { years } = useYears()
  const enabledTestMode = useFeatureFlag(FeatureFlag.ENABLE_TEST_MODE)

  const { selectedYear, setSelectedYear } = useSelectedYear()
  const { scores } = useMyScores()

  const currentScore = selectedYear
    ? scores?.find((score) => score.year === Number(selectedYear.year))
    : null

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = years!.find((y) => y.year === e.target.value)
    if (year) setSelectedYear(year)
  }

  return (
    <>
      <Navbar />
      {enabledTestMode && years && (
        <select
          onChange={handleOnChange}
          value={selectedYear?.year}
          className="bg-red-500"
        >
          {years?.map((year) => (
            <option key={year.year}>{year.year}</option>
          ))}
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
