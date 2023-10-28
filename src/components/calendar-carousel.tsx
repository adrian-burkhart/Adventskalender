import { memo } from "react"
import { useSelectedYear } from "@/lib/context"
import Link from "next/link"
import doorClosedOne from "../../public/images/door-closed-1.webp"
import doorClosedTwo from "../../public/images/door-closed-2.webp"
// import doorOpen from "../../public/images/door-open.webp"
import Image from "next/image"

type DoorState = "closed-one" | "closed-two" | "open"

const CalendarDoor = memo(
  ({ state, doorNumber }: { state: DoorState; doorNumber: number }) => {
    const { selectedYear } = useSelectedYear()!

    const imageUrl = state === "closed-one" ? doorClosedOne : doorClosedTwo
    const route = selectedYear ? `/${selectedYear.year}${doorNumber}` : ""

    return (
      <Link className="flex items-center justify-center shadow-md" href={route}>
        <Image src={imageUrl} alt={`Tür Nummer ${doorNumber}`} />
      </Link>
    )
  },
)

const Calendar = memo(() => {
  const { selectedYear } = useSelectedYear()!

  if (!selectedYear) {
    return <div>Kein Jahr ausgewählt</div>
  }

  if (!selectedYear.questions) {
    return <div>Keine Fragen für dieses Jahr</div>
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {selectedYear.questions.map((_, i) => {
        return (
          <CalendarDoor
            state={i % 2 === 0 ? "closed-one" : "closed-two"}
            key={i}
            doorNumber={i + 1}
          />
        )
      })}
    </div>
  )
})

export default Calendar
