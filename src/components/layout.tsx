"use client"

import { ReactNode, memo } from "react"
import Image from "next/image"
import Navbar from "./navbar"
import { useMyScores } from "@/lib/hooks"
import { useSelectedYear } from "@/lib/context"
import Footer from "./footer"
import star from "../../public/images/star.webp"

const Layout = memo(({ children }: { children: ReactNode }) => {
  // Always this season's points, whatever year the calendar shows.
  const { currentYear } = useSelectedYear()
  const { scores } = useMyScores()

  const currentScore = currentYear
    ? scores?.find((score) => score.year === Number(currentYear))
    : null

  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl flex-wrap items-start justify-between gap-x-4 gap-y-2 px-2 pt-2">
        <div className="flex flex-col items-start gap-2">
          {currentScore && (
            <div className="flex items-center gap-2 card rounded-full py-1 pr-4 pl-1.5">
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
