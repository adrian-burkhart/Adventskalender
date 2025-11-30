import { memo, useState, useCallback, useEffect } from "react"
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
import { FeatureFlag, useFeatureFlag } from "@/lib/feature-flags"

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
  doorState: DoorState
}

const Door = memo(({ delayedNavigation, imageUrl, doorNumber, doorState }: DoorProps) => {
  const isAnswered = doorState === "answered"

  return (
    <div
      onClick={delayedNavigation}
      className={clsx(
        "relative flex gap-2 transition-transform duration-200",
        !isAnswered && "cursor-pointer hover:scale-105"
      )}
    >
      <div
        className={clsx(
          "absolute inset-0 top-[40%] text-center text-2xl text-red-500 md:top-[40%] md:text-5xl",
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
    playChristmas,
    playLocked,
    variant,
    playUpsi,
    openDoor,
    doorState,
    doorNumber,
    selectedYear,
  }: {
    playUpsi: () => void
    playLocked: () => void
    playOpen: () => void
    playChristmas: () => void
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

    useEffect(() => {
      setImageUrl(mapDoorStateToImageUrl(doorState, variant))
    }, [doorState, variant])

    const enabledTestMode = useFeatureFlag(FeatureFlag.ENABLE_TEST_MODE)

    const delayedNavigation = useCallback(() => {
      if (!enabledTestMode && doorState === "answered") {
        return
      }
      if (!enabledTestMode && doorState === "locked") {
        setImageUrl(doorLocked)
        playLocked()
        playUpsi()
        setTimeout(() => {
          setImageUrl(mapDoorStateToImageUrl(doorState, variant))
        }, 4000)
        return
      }
      playOpen()
      if (doorNumber === 24) {
        playChristmas()
      }

      setImageUrl(doorOpen)
      setTimeout(() => {
        openDoor().then(() => {
          window.location.href = route
        })
      }, 6000)
    }, [
      route,
      openDoor,
      playChristmas, enabledTestMode,
      doorState,
      playUpsi,
      doorNumber,
      variant,
      playLocked,
      playOpen,
    ])

    return (
      <Door
        delayedNavigation={delayedNavigation}
        doorNumber={doorNumber}
        imageUrl={imageUrl}
        doorState={doorState}
      />
    )
  },
)

const Calendar = memo(({ player }: { player: Player }) => {
  const { selectedYear } = useSelectedYear()
  const { doorStates, openDoor, loading, error } = useDoors(
    player,
    selectedYear,
  )

  const [playOpen] = useSound("/sounds/opening-door.mp3")
  const [playLocked] = useSound("/sounds/locked-door.mp3")
  const [playChristmas] = useSound("/sounds/christmas.mp3")
  const [playUpsi] = useSound("/sounds/upsi.mp3")

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
    <div className="grid grid-cols-2 items-center gap-4">
      {doorStates.map((doorState, i) => {
        return (
          <CalendarDoor
            key={i}
            variant={(i + 1) % 4 < 2 ? "closed-one" : "closed-two"}
            playOpen={playOpen}
            selectedYear={selectedYear}
            playLocked={playLocked}
            playChristmas={playChristmas}
            doorNumber={i + 1}
            playUpsi={playUpsi}
            openDoor={() => openDoor(i + 1)}
            doorState={doorState}
          />
        )
      })}
    </div>
  )
})

export default Calendar
