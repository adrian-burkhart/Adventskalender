"use client"

import { ReactNode, createContext, useContext, useState } from "react"
import { dateNowUtc, dateTimeFromIso } from "./dateTime"
import { last } from "lodash"
import { Year, useYears } from "./hooks"

function getInitialYear(years: Year[]) {
  const now = dateNowUtc()

  const currentYear = years?.find((year) =>
    dateTimeFromIso(year.year).hasSame(now, "year"),
  )

  const lastYear = last(years)

  if (currentYear) {
    return currentYear
  }

  if (lastYear) {
    return lastYear
  }

  return null
}

const YearContext = createContext<{
  selectedYear: Year | null
  setSelectedYear: React.Dispatch<React.SetStateAction<Year | null>>
} | null>(null)

export const useSelectedYear = () => {
  const context = useContext(YearContext)
  if (!context) {
    throw new Error("useSelectedYear must be used within a YearProvider")
  }
  return context
}

export const YearProvider = ({ children }: { children: ReactNode }) => {
  const [chosenYear, setSelectedYear] = useState<Year | null>(null)
  const { years } = useYears()
  const selectedYear = chosenYear ?? (years ? getInitialYear(years) : null)

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </YearContext.Provider>
  )
}
