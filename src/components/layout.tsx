"use client"

import { ReactNode, memo } from "react"
import Image from "next/image"
import Navbar from "./navbar"
import { useMyScores } from "@/lib/hooks"
import { useSelectedYear } from "@/lib/context"
import Footer from "./footer"
import { FeatureFlag, useFeatureFlag } from "@/lib/feature-flags"
import star from "../../public/images/star.webp"

const Layout = memo(({ children }: { children: ReactNode }) => {
  const enabledTestMode = useFeatureFlag(FeatureFlag.ENABLE_TEST_MODE)

  const { years, selectedYear, setSelectedYear } = useSelectedYear()
  const { scores } = useMyScores()

  const currentScore = selectedYear
    ? scores?.find((score) => score.year === Number(selectedYear.year))
    : null

  const handleOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = years.find((y) => y.year === e.target.value)
    if (year) setSelectedYear(year)
  }

  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl items-start justify-between gap-4 px-2 pt-2">
        <div className="flex flex-col items-start gap-2">
          {currentScore && (
            <div className="card flex items-center gap-2 rounded-full py-1 pl-1.5 pr-4">
              <Image src={star} width={28} height={28} alt="" />
              <span className="text-base">
                Deine Punkte:{" "}
                <strong className="font-display text-xl text-candle">
                  {currentScore.score}
                </strong>
              </span>
            </div>
          )}
          {enabledTestMode && years.length > 0 && (
            <select
              aria-label="Jahr (Testmodus)"
              onChange={handleOnChange}
              value={selectedYear?.year}
              className="rounded bg-berry px-2 py-1 text-base text-white"
            >
              {years.map((year) => (
                <option key={year.year}>{year.year}</option>
              ))}
            </select>
          )}
        </div>
        <Navbar />
      </header>
      <main className="flex flex-col items-center justify-center pt-6">
        {children}
      </main>
      <Footer />
    </>
  )
})

export default Layout
