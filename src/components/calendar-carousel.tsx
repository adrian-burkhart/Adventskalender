import { memo } from "react"
import { useSelectedYear } from "@/lib/context"
import Link from "next/link"

const CalendarDoor = memo(({ doorNumber }: { doorNumber: number }) => {
  const { selectedYear } = useSelectedYear()!

  const route = selectedYear ? `/${selectedYear.year}${doorNumber}` : ""

  return (
    <Link href={route}>
      <div className="flex h-48 w-32 items-center justify-center bg-red-500 shadow-md hover:bg-red-900">
        <div>{doorNumber}</div>
      </div>
    </Link>
  )
})

const Calendar = memo(() => {
  const { selectedYear } = useSelectedYear()!

  if (!selectedYear) {
    return <div>Kein Jahr ausgewählt</div>
  }

  if (!selectedYear.questions) {
    return <div>Keine Fragen für dieses Jahr</div>
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {selectedYear.questions.map((question, i) => {
        return <CalendarDoor key={i} doorNumber={i + 1} />
      })}
    </div>
  )
})

export default Calendar
