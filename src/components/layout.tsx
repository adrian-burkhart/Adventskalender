import { ReactNode, memo } from "react"
import Navbar from "./navbar"
import { usePlayer, useYears } from "@/lib/hooks"
import { useSelectedYear } from "@/lib/context"
import { dateTimeFromIso } from "@/lib/dateTime"

const Layout = memo(({ children }: { children: ReactNode }) => {
  const { years, loading: yearsLoading, error: yearsError } = useYears()

  const { selectedYear, setSelectedYear } = useSelectedYear()!
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
      <Navbar />
      {years && (
        <select
          onChange={handleOnChange}
          value={selectedYear?.year}
          className="bg-red-500"
        >
          {years?.map((year) => <option key={year.year}>{year.year}</option>)}
        </select>
      )}
      {currentScore && <div>Aktuelle Punkte: {currentScore.score}</div>}
      <main className="flex flex-col items-center justify-center pt-16">
        {children}
      </main>
    </>
  )
})

export default Layout
