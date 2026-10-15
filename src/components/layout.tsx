"use client"

import { ReactNode, memo } from "react"
import Image from "next/image"
import Navbar from "./navbar"
import { useMyScores } from "@/lib/hooks"
import { useSelectedYear } from "@/lib/context"
import Footer from "./footer"
import star from "../../public/images/star.webp"

const Layout = memo(({ children }: { children: ReactNode }) => {
  const { selectedYear } = useSelectedYear()
  const { scores } = useMyScores()

  const currentScore = selectedYear
    ? scores?.find((score) => score.year === Number(selectedYear.year))
    : null

  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-start justify-between gap-x-4 gap-y-2 px-2 pt-2">
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
