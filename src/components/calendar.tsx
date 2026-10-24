"use client"

import {
  memo,
  useState,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import { useSelectedYear } from "@/lib/context"
import doorClosedOne from "../../public/images/door-closed-1.webp"
import doorClosedTwo from "../../public/images/door-closed-2.webp"
import doorOpen from "../../public/images/door-open.webp"
import doorAnswered from "../../public/images/door-answered.webp"
import doorLocked from "../../public/images/door-locked.webp"
import Image from "next/image"
import useSound from "use-sound"
import { useDoors, DoorState, type InitialDoors } from "@/lib/hooks"
import clsx from "clsx"
import { ERROR_TEXT } from "@/lib/texts"
import Loading from "./loading"
import { FeatureFlag, useFeatureFlag } from "@/lib/feature-flags"
import { doorPath } from "@/lib/routes"

/**
 * How long the door opens before the question page shows. The opening sound
 * fades out after about 4.5 seconds; door 24's Christmas music after 6.5.
 */
const OPENING_MS = 4500
const OPENING_MS_DOOR_24 = 6500
/** How long a locked door shows its padlock. */
const LOCKED_MS = 3000

type DoorVariant = "closed-one" | "closed-two"

// Where the little stars appear around the number, in % of the door, and
// how far each one drifts.
const SPARKS = [
  { left: 30, top: 34, dx: -14, dy: -18, size: 13, delay: 0 },
  { left: 68, top: 30, dx: 16, dy: -20, size: 10, delay: 0.08 },
  { left: 40, top: 55, dx: -12, dy: 6, size: 8, delay: 0.18 },
  { left: 62, top: 52, dx: 12, dy: 4, size: 12, delay: 0.12 },
  { left: 50, top: 22, dx: 2, dy: -24, size: 9, delay: 0.26 },
  { left: 24, top: 46, dx: -16, dy: -4, size: 7, delay: 0.32 },
  { left: 76, top: 44, dx: 14, dy: -6, size: 7, delay: 0.22 },
]

/** The door number sits on the wreath; it flies up with a few sparkling stars. */
function FloatingNumber({
  doorNumber,
  lifted,
}: {
  doorNumber: number
  lifted: boolean
}) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <span
        className={clsx(
          "absolute inset-0 transition-[translate,opacity,scale] duration-1000",
          lifted
            ? "-translate-y-[45%] scale-75 opacity-0 ease-in"
            : "translate-y-0 scale-100 opacity-100 ease-out",
        )}
      >
        {/* Sits right in the middle of the wreath on the door. */}
        <span className="absolute top-[43.8%] left-[49.3%] h-[13.5%] -translate-x-1/2 -translate-y-1/2">
          <Image
            src={`/images/numbers/${String(doorNumber).padStart(2, "0")}.webp`}
            alt=""
            width={170}
            height={150}
            sizes="(min-width: 640px) 90px, 70px"
            className="h-full max-w-none drop-shadow-[0_1px_2px_rgb(0_0_0/0.6)]"
            style={{ width: "auto" }}
          />
        </span>
      </span>
      {lifted &&
        SPARKS.map((spark, i) => (
          <svg
            key={i}
            viewBox="-10 -10 20 20"
            className="door-spark absolute"
            style={
              {
                left: `${spark.left}%`,
                top: `${spark.top}%`,
                width: spark.size * 1.6,
                height: spark.size * 1.6,
                animationDelay: `${spark.delay}s`,
                "--dx": `${spark.dx}px`,
                "--dy": `${spark.dy}px`,
              } as CSSProperties
            }
          >
            <path
              d="M0 -10 Q1.2 -1.2 10 0 Q1.2 1.2 0 10 Q-1.2 1.2 -10 0 Q-1.2 -1.2 0 -10Z"
              fill="#fdf6c8"
            />
            <circle r="1.8" fill="#fff" />
          </svg>
        ))}
    </span>
  )
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
  variant: DoorVariant
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
    variant,
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
    const closedImage = variant === "closed-one" ? doorClosedOne : doorClosedTwo
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
            src={isAnswered ? doorAnswered : closedImage}
            alt={`Tür Nummer ${doorNumber}`}
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
        {/* The number sits on the door. When the door opens (or shows
            its lock) it flies up and a few little stars sparkle. */}
        <FloatingNumber
          doorNumber={doorNumber}
          lifted={isOpening || showLock}
        />
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
    /** Shown above the doors. */
    greeting?: ReactNode
  }) => {
    const { selectedYear } = useSelectedYear()
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

    return (
      <div className="flex w-full flex-col items-center gap-10">
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
                  variant={doorNumber % 4 < 2 ? "closed-one" : "closed-two"}
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
