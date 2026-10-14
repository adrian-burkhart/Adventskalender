"use client"

import { ReactNode, createContext, useContext, useState } from "react"
import { Year, useYears } from "./hooks"

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
  const { years, currentYear } = useYears()
  // The calendar shows the current year unless an admin picks another.
  const selectedYear =
    chosenYear ?? years?.find((y) => y.year === currentYear) ?? null

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </YearContext.Provider>
  )
}
