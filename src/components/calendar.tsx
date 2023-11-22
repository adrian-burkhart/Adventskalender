import { memo, useState, useCallback } from "react"
import { useSelectedYear } from "@/lib/context"
import doorClosedOne from "../../public/images/door-closed-1.webp"
import doorClosedTwo from "../../public/images/door-closed-2.webp"
import doorOpen from "../../public/images/door-open.webp"
import doorAnswered from "../../public/images/door-answered.webp"
import doorLocked from "../../public/images/door-locked.webp"
import Image, { StaticImageData } from "next/image"
// @ts-ignore
import useSound from "use-sound"
import { useDoors, DoorState, Year, Player } from "@/lib/hooks"
import localFont from "next/font/local"
import clsx from "clsx"

function mapDoorStateToImageUrl(doorState: DoorState, variant: DoorVariant) {
  if (doorState === "open") {
    return doorOpen
  }
  if (doorState === "answered") {
    return doorAnswered
  }

  switch (variant) {
    case "closed-one":
      return doorClosedOne
    case "closed-two":
      return doorClosedTwo
  }
}

const myFont = localFont({
  src: "../../public/Cochin Bold Italic.otf",
  display: "swap",
})

interface DoorProps {
  delayedNavigation: () => void
  imageUrl: StaticImageData
  doorNumber: number
}

const Door = memo(({ delayedNavigation, imageUrl, doorNumber }: DoorProps) => {
  return (
    <div onClick={delayedNavigation} className="relative flex gap-2">
      <div
        className={clsx(
          "absolute inset-0  top-[32%] text-center text-xl text-red-500 md:top-[40%] md:text-5xl",
          myFont.className,
        )}
      >
        {doorNumber}
      </div>
      <div className="flex items-center justify-center shadow-md">
        <Image src={imageUrl} alt={`Tür Nummer ${doorNumber}`} />
      </div>
    </div>
  )
})

type DoorVariant = "closed-one" | "closed-two"

const CalendarDoor = memo(
  ({
    playOpen,
    playLocked,
    variant,
    openDoor,
    doorState,
    doorNumber,
    selectedYear,
  }: {
    playLocked: () => void
    playOpen: () => void
    openDoor: () => Promise<void>
    doorState: DoorState
    selectedYear: Year
    variant: DoorVariant
    doorNumber: number
  }) => {
    const route = selectedYear ? `/${selectedYear.year}${doorNumber}` : ""
    const [imageUrl, setImageUrl] = useState(
      mapDoorStateToImageUrl(doorState, variant),
    )

    const delayedNavigation = useCallback(() => {
      if (doorState === "locked") {
        setImageUrl(doorLocked)
        playLocked()
        setTimeout(() => {
          setImageUrl(mapDoorStateToImageUrl(doorState, variant))
        }, 3000)
        return
      }
      playOpen()
      if (doorState !== "answered") {
        setImageUrl(doorOpen)
      }
      setTimeout(() => {
        openDoor().then(() => {
          window.location.href = route
        })
      }, 3000)
    }, [route, openDoor, doorState, variant, playLocked, playOpen])

    return (
      <Door
        delayedNavigation={delayedNavigation}
        doorNumber={doorNumber}
        imageUrl={imageUrl}
      />
    )
  },
)

const Calendar = memo(({ player }: { player: Player }) => {
  const { selectedYear } = useSelectedYear()!
  const { doorStates, openDoor, loading, error } = useDoors(
    player,
    selectedYear,
  )

  const [playOpen] = useSound("/sounds/creaking-door.mp3")
  const [playLocked] = useSound("/sounds/locked-door.mp3")

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{"Error"}</div>
  }

  if (!selectedYear) {
    return <div>Kein Jahr ausgewählt</div>
  }

  if (!selectedYear.questions) {
    return <div>Keine Fragen für dieses Jahr</div>
  }

  return (
    <div className="grid w-full grid-cols-3 items-center gap-4">
      {doorStates.map((doorState, i) => {
        return (
          <CalendarDoor
            key={i}
            variant={i % 2 === 0 ? "closed-one" : "closed-two"}
            playOpen={playOpen}
            selectedYear={selectedYear}
            playLocked={playLocked}
            doorNumber={i + 1}
            openDoor={() => openDoor(i + 1)}
            doorState={doorState}
          />
        )
      })}
    </div>
  )
})

export default Calendar
