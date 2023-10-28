import { memo, useState, useCallback } from "react"
import { useSelectedYear } from "@/lib/context"
import doorClosedOne from "../../public/images/door-closed-1.webp"
import doorClosedTwo from "../../public/images/door-closed-2.webp"
import doorOpen from "../../public/images/door-open.webp"
import Image from "next/image"
// @ts-ignore
import useSound from "use-sound"
import { usePlayer, DoorState, useDoors } from "@/lib/hooks"

function mapDoorStateToImageUrl(state: DoorState) {
  switch (state) {
    case "open":
      return doorOpen
    case "closed-one":
      return doorClosedOne
    case "closed-two":
      return doorClosedTwo
  }
}

const CalendarDoor = memo(
  ({ state, doorNumber }: { state: DoorState; doorNumber: number }) => {
    const { selectedYear } = useSelectedYear()!
    const { player } = usePlayer()
    const { openDoor, isOpen, doorState, setDoorState, loading, error } =
      useDoors(player, selectedYear, doorNumber, state)
    const [play] = useSound("/sounds/creaking-door-2.wav")

    const route = selectedYear ? `/${selectedYear.year}${doorNumber}` : ""

    const delayedNavigation = useCallback(() => {
      play()
      setDoorState("open")
      openDoor()
      setTimeout(() => {
        window.location.href = route
      }, 3000)
    }, [route, openDoor, setDoorState, play])

    return loading ? (
      <div>Loading...</div>
    ) : error ? (
      <div>Error</div>
    ) : (
      <div
        className="flex items-center justify-center shadow-md"
        onClick={delayedNavigation}
      >
        <Image
          src={mapDoorStateToImageUrl(isOpen ? "open" : doorState)}
          alt={`Tür Nummer ${doorNumber}`}
        />
      </div>
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
