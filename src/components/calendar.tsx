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

type DoorVariant = "closed-one" | "closed-two"

/** What a door says about itself, for screen readers. */
// Where each door number's string is tied on, measured in the Cochin font
// (in em, from the baseline up and from the middle sideways): the top of the
// digit nearest the middle. The figures lean right, so their tops sit a
// little right of centre; on two-digit numbers it is the first digit.
const HOOKS: [ascent: number, x: number][] = [
  [0.665, 0.105],
  [0.665, 0.065],
  [0.655, 0.098],
  [0.68, 0.258],
  [0.65, 0.025],
  [0.69, 0.212],
  [0.65, 0.13],
  [0.665, 0.095],
  [0.665, 0.08],
  [0.665, -0.145],
  [0.665, -0.145],
  [0.665, -0.145],
  [0.665, -0.145],
  [0.665, -0.107],
  [0.665, -0.133],
  [0.665, -0.087],
  [0.665, -0.145],
  [0.665, -0.145],
  [0.665, -0.145],
  [0.665, -0.185],
  [0.665, -0.185],
  [0.665, -0.185],
  [0.665, -0.185],
  [0.665, -0.182],
]

/** The hook of a door number, from the top-left of a line of height 1. */
function hook(doorNumber: number) {
  const [ascent, x] = HOOKS[doorNumber - 1] ?? [0.665, 0]
  // The baseline sits 0.845em below the top of a line of height 1.
  return { top: 0.845 - ascent, x }
}

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
        {/* The number hangs from the top on a thin string. When the door
            opens (or shows its lock) it is pulled up and out of the way. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        >
          <span
            className={clsx(
              "absolute inset-0 transition-[translate] duration-700",
              isOpening || showLock
                ? "-translate-y-full ease-in"
                : "translate-y-0 ease-out",
            )}
          >
            <span
              className="door-hanger absolute inset-0"
              style={{ animationDelay: `${-((doorNumber * 1.7) % 5)}s` }}
            >
              <span className="absolute inset-x-0 top-[38%] text-center font-door text-5xl leading-none text-berry-light [text-shadow:0_0_6px_rgb(255_255_255/0.85),0_2px_4px_rgb(0_0_0/0.6)] sm:text-6xl">
                {/* The string runs from the top edge down to the very top of
                    the digits, where the little ring holds them. */}
                <span
                  className="absolute h-[20em] w-[1.5px] -translate-x-1/2 bg-[#e8d9b0] shadow-[0_0_2px_rgb(0_0_0/0.6)]"
                  style={{
                    left: `calc(50% + ${hook(doorNumber).x}em)`,
                    bottom: `calc(100% - ${hook(doorNumber).top - 0.1}em)`,
                  }}
                />
                <span
                  className="absolute h-[0.17em] w-[0.17em] -translate-x-1/2 rounded-full border-[1.5px] border-[#d9b25a]"
                  style={{
                    left: `calc(50% + ${hook(doorNumber).x}em)`,
                    top: `${hook(doorNumber).top - 0.12}em`,
                  }}
                />
                {doorNumber}
              </span>
            </span>
          </span>
        </span>
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
