import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
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
  return useContext(YearContext)
}

export const YearProvider = ({ children }: { children: ReactNode }) => {
  const [selectedYear, setSelectedYear] = useState<Year | null>(null)
  const { years } = useYears()

  useEffect(() => {
    if (years) {
      setSelectedYear(getInitialYear(years))
    }
  }, [years])

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </YearContext.Provider>
  )
}
