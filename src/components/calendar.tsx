"use client"

import {
  memo,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { useSelectedYear } from "@/lib/context"
import doorOpen from "../../public/images/door-open.webp"
import doorAnswered from "../../public/images/door-answered.webp"
import doorLocked from "../../public/images/door-locked.webp"
import Image from "next/image"
import useSound from "use-sound"
import { useDoors, DoorState, type InitialDoors } from "@/lib/hooks"
import clsx from "clsx"
import { ERROR_TEXT } from "@/lib/texts"
import Loading from "./loading"
import ChristmasTree from "./christmas-tree"
import { FeatureFlag, useFeatureFlag } from "@/lib/feature-flags"
import { doorPath } from "@/lib/routes"
import { hasDecorations } from "@/lib/doors"

/**
 * How long the door opens before the question page shows. The opening sound
 * fades out after about 4.5 seconds; door 24's Christmas music after 6.5.
 */
const OPENING_MS = 4500
const OPENING_MS_DOOR_24 = 6500
/** How long a locked door shows its padlock. */
const LOCKED_MS = 3000

/** The closed door, painted with its number. */
function closedDoorImage(doorNumber: number) {
  return `/images/doors/door-${String(doorNumber).padStart(2, "0")}.webp`
}

/** What a door says about itself, for screen readers. */
function statusText(state: DoorState, isToday: boolean, isMissed: boolean) {
  if (state === "answered") return "schon beantwortet"
  if (state === "past") return "zum Anhören"
  if (state === "locked") return "noch verschlossen"
  if (isToday) return "heute"
  if (isMissed) return "zum Nachholen"
  return ""
}

interface CalendarDoorProps {
  doorNumber: number
  doorState: DoorState
  isToday: boolean
  isMissed: boolean
  /** True while this door opens. */
  isOpening: boolean
  /** True while another door opens: then this one waits. */
  isBusy: boolean
  onOpen: (doorNumber: number) => void
  onLocked: () => void
  onReview: (doorNumber: number) => void
}

const CalendarDoor = memo(
  ({
    doorNumber,
    doorState,
    isToday,
    isMissed,
    isOpening,
    isBusy,
    onOpen,
    onLocked,
    onReview,
  }: CalendarDoorProps) => {
    const enabledTestMode = useFeatureFlag(FeatureFlag.ENABLE_TEST_MODE)
    const [showLock, setShowLock] = useState(false)
    const lockTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
    useEffect(() => () => clearTimeout(lockTimer.current), [])

    const isAnswered = doorState === "answered"
    const isLocked = doorState === "locked"
    const isPast = doorState === "past"
    const showOpen = isOpening || doorState === "open"

    const handleClick = () => {
      if (isBusy || isOpening) return
      // An answered door opens straight to the look back at it.
      if (!enabledTestMode && isAnswered) return onReview(doorNumber)
      // A door of a past season opens straight away, to listen to.
      if (isPast) return onReview(doorNumber)
      if (!enabledTestMode && isLocked) {
        if (showLock) return
        setShowLock(true)
        onLocked()
        lockTimer.current = setTimeout(() => setShowLock(false), LOCKED_MS)
        return
      }
      onOpen(doorNumber)
    }

    const status = statusText(doorState, isToday, isMissed)

    return (
      <button
        type="button"
        onClick={handleClick}
        aria-disabled={isBusy}
        className={clsx(
          "group relative block w-full rounded-2xl transition-transform duration-200 focus-visible:ring-4 focus-visible:ring-gold/70 focus-visible:outline-hidden",
          !isBusy && "cursor-pointer hover:scale-[1.03]",
          isBusy && "cursor-default",
          isToday && !isAnswered && "animate-glow",
          showLock && "animate-[shake_0.5s_ease-in-out]",
        )}
      >
        <div className="relative overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={isAnswered ? doorAnswered : closedDoorImage(doorNumber)}
            alt={`Tür Nummer ${doorNumber}`}
            width={400}
            height={411}
            sizes="(min-width: 1024px) 260px, (min-width: 640px) 33vw, 50vw"
            className="h-auto w-full"
          />
          {!isAnswered && (
            <Image
              src={doorOpen}
              alt=""
              aria-hidden
              sizes="(min-width: 1024px) 260px, (min-width: 640px) 33vw, 50vw"
              className={clsx(
                "absolute inset-0 h-full w-full transition-opacity duration-700",
                showOpen ? "opacity-100" : "opacity-0",
              )}
            />
          )}
          <Image
            src={doorLocked}
            alt=""
            aria-hidden
            sizes="(min-width: 1024px) 260px, (min-width: 640px) 33vw, 50vw"
            className={clsx(
              "absolute inset-0 h-full w-full transition-opacity duration-300",
              showLock ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
        {status && <span className="sr-only">({status})</span>}
      </button>
    )
  },
)

const Calendar = memo(
  ({
    initialDoors,
    greeting,
  }: {
    initialDoors?: InitialDoors
    /** Shown under the tree, above the doors. */
    greeting?: ReactNode
  }) => {
    const { selectedYear, currentYear } = useSelectedYear()
    const { doorStates, today, openDoor, loading, error } = useDoors(
      selectedYear,
      initialDoors,
    )
    const router = useRouter()
    const [openingDoor, setOpeningDoor] = useState<number | null>(null)

    const [playOpen, { stop: stopOpen }] = useSound("/sounds/opening-door.mp3")
    const [playLocked, { stop: stopLocked }] = useSound(
      "/sounds/locked-door.mp3",
    )
    const [playChristmas, { stop: stopChristmas }] = useSound(
      "/sounds/christmas.mp3",
    )
    const [playUpsi, { stop: stopUpsi }] = useSound("/sounds/upsi.mp3")

    // Leaving the calendar ends its sounds, as the full page load used to.
    const stopAll = useRef<() => void>(() => {})
    useEffect(() => {
      stopAll.current = () => {
        stopOpen()
        stopLocked()
        stopChristmas()
        stopUpsi()
      }
    }, [stopOpen, stopLocked, stopChristmas, stopUpsi])
    useEffect(() => () => stopAll.current(), [])

    const handleLocked = useCallback(() => {
      playLocked()
      playUpsi()
    }, [playLocked, playUpsi])

    const handleReview = useCallback(
      (doorNumber: number) => {
        if (selectedYear) router.push(doorPath(selectedYear.year, doorNumber))
      },
      [selectedYear, router],
    )

    // Answered doors are just a look back: get their pages ready beforehand.
    useEffect(() => {
      if (!selectedYear || !doorStates) return
      doorStates.forEach((state, i) => {
        if (state === "answered" || state === "past") {
          router.prefetch(doorPath(selectedYear.year, i + 1))
        }
      })
    }, [selectedYear, doorStates, router])

    const handleOpen = useCallback(
      (doorNumber: number) => {
        if (!selectedYear) return
        const route = doorPath(selectedYear.year, doorNumber)
        // One door at a time: a second tap would open it twice.
        setOpeningDoor(doorNumber)
        playOpen()
        if (doorNumber === 24) playChristmas()

        // Save the opening and load the door page while the door opens, so
        // the question is there right after the animation.
        const opened = openDoor(doorNumber)
        router.prefetch(route)
        setTimeout(
          () => {
            opened.then(() => router.push(route))
          },
          doorNumber === 24 ? OPENING_MS_DOOR_24 : OPENING_MS,
        )
      },
      [selectedYear, openDoor, router, playOpen, playChristmas],
    )

    if (error) {
      return <div>{ERROR_TEXT}</div>
    }

    if (!selectedYear || loading || !doorStates) {
      return <Loading />
    }

    // Past years without content (2024) say so; the current year always shows
    // its doors, which stay locked until December.
    if (
      !selectedYear.questionCount &&
      Number(selectedYear.year) < new Date().getFullYear()
    ) {
      return <div>Keine Fragen für dieses Jahr</div>
    }

    const answered = doorStates.filter((state) => state === "answered").length

    return (
      <div className="flex w-full flex-col items-center gap-10">
        {hasDecorations(Number(selectedYear.year), Number(currentYear)) && (
          <ChristmasTree ornaments={answered} className="w-48 sm:w-60" />
        )}
        {greeting}
        <ol className="grid w-full max-w-5xl grid-cols-2 gap-4 px-1 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
          {doorStates.map((doorState, i) => {
            const doorNumber = i + 1
            const isToday = today === doorNumber
            // An earlier door that can still be answered.
            const isMissed =
              !isToday &&
              (doorState === "closed" || doorState === "open") &&
              (today === null || doorNumber < today)
            return (
              <li key={doorNumber}>
                <CalendarDoor
                  doorNumber={doorNumber}
                  doorState={doorState}
                  isToday={isToday}
                  isMissed={isMissed}
                  isOpening={openingDoor === doorNumber}
                  isBusy={openingDoor !== null && openingDoor !== doorNumber}
                  onOpen={handleOpen}
                  onLocked={handleLocked}
                  onReview={handleReview}
                />
              </li>
            )
          })}
        </ol>
      </div>
    )
  },
)

export default Calendar
