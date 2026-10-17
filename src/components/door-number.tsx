"use client"

import {
  useCallback,
  useId,
  useSyncExternalStore,
  type CSSProperties,
} from "react"
import clsx from "clsx"

// Proposals for how a door shows its number. /vorschau picks one; the choice
// is kept on this device so the real calendar shows it too.

export type DoorNumberStyle =
  "band" | "band-gruen" | "sterne" | "darueber" | "daneben" | "laterne"

export const DOOR_NUMBER_STYLES: {
  id: DoorNumberStyle
  name: string
  description: string
}[] = [
  {
    id: "band",
    name: "Am Band (jetzt)",
    description:
      "Die Zahl hängt an einem hellen Band mit goldenem Ring und wird beim Öffnen hochgezogen.",
  },
  {
    id: "band-gruen",
    name: "Dunkelgrünes Band",
    description:
      "Wie jetzt, aber Band und Ring sind dunkelgrün und verschwinden fast im Tannengrün.",
  },
  {
    id: "sterne",
    name: "Sternenzauber",
    description:
      "Kein Band: Die Zahl schwebt. Beim Öffnen fliegt sie nach oben davon und ein paar kleine Sterne funkeln auf.",
  },
  {
    id: "darueber",
    name: "Über der Tür",
    description:
      "Die Zahl steht in Gold über dem Bild, die Tür selbst bleibt frei. Beim Öffnen leuchtet sie auf.",
  },
  {
    id: "daneben",
    name: "Neben der Tür",
    description:
      "Die Zahl steht in Gold links neben dem Bild. Die Türen werden dadurch etwas schmaler.",
  },
  {
    id: "laterne",
    name: "Laterne",
    description:
      "Neben der Tür steht eine kleine gezeichnete Laterne mit Schneehaube, die Zahl auf dem Glas. Beim Öffnen flammt die Kerze auf.",
  },
]

export const DEFAULT_DOOR_NUMBER_STYLE: DoorNumberStyle = "band"

const STORAGE_KEY = "DOOR_NUMBER_STYLE"
const CHANGE_EVENT = "door-number-style"

function readStyle(): DoorNumberStyle {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (DOOR_NUMBER_STYLES.some((s) => s.id === stored)) {
      return stored as DoorNumberStyle
    }
  } catch {
    // No storage (private mode): keep the default.
  }
  return DEFAULT_DOOR_NUMBER_STYLE
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

/** The door number style chosen on this device, and a way to change it. */
export function useDoorNumberStyle() {
  const style = useSyncExternalStore(
    subscribe,
    readStyle,
    () => DEFAULT_DOOR_NUMBER_STYLE,
  )
  const setStyle = useCallback((next: DoorNumberStyle) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Without storage the choice can't be kept.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }, [])
  return [style, setStyle] as const
}

/** Styles where the number sits outside the picture. */
export function isOutside(style: DoorNumberStyle) {
  return style === "darueber" || style === "daneben"
}

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

const NUMBER_ON_DOOR =
  "absolute inset-x-0 top-[38%] text-center font-door text-5xl leading-none text-berry-light [text-shadow:0_0_6px_rgb(255_255_255/0.85),0_2px_4px_rgb(0_0_0/0.6)] sm:text-6xl"

interface OverlayProps {
  doorNumber: number
  style: DoorNumberStyle
  /** True while the door opens or shows its lock: the number makes way. */
  lifted: boolean
  /** True while the door opens. */
  opening: boolean
}

/** The number laid over the door picture, for the styles that do that. */
export function DoorNumberOverlay({
  doorNumber,
  style,
  lifted,
  opening,
}: OverlayProps) {
  if (style === "band" || style === "band-gruen") {
    return (
      <HangingNumber
        doorNumber={doorNumber}
        lifted={lifted}
        green={style === "band-gruen"}
      />
    )
  }
  if (style === "sterne") {
    return <FloatingNumber doorNumber={doorNumber} lifted={lifted} />
  }
  if (style === "laterne") {
    return (
      <span
        aria-hidden
        className="pointer-events-none absolute right-[1%] bottom-[1%] w-[40%]"
      >
        <Lantern doorNumber={doorNumber} bright={opening} />
      </span>
    )
  }
  return null
}

/** The number next to or above the picture, for the styles that do that. */
export function DoorNumberOutside({
  doorNumber,
  style,
  opening,
}: {
  doorNumber: number
  style: DoorNumberStyle
  opening: boolean
}) {
  return (
    <span
      aria-hidden
      className={clsx(
        "pointer-events-none block shrink-0 font-door leading-none transition-[color,text-shadow] duration-700",
        style === "darueber"
          ? "pb-1 text-center text-4xl sm:text-5xl"
          : "w-[1.15em] text-center text-3xl sm:text-4xl",
        opening
          ? "text-candle [text-shadow:0_0_10px_rgb(254_240_138/0.9),0_0_24px_rgb(233_196_106/0.7)]"
          : "text-gold-light [text-shadow:0_2px_3px_rgb(0_0_0/0.55)]",
      )}
    >
      {doorNumber}
    </span>
  )
}

/** The number hangs from the top on a thin string with a small ring. */
function HangingNumber({
  doorNumber,
  lifted,
  green,
}: {
  doorNumber: number
  lifted: boolean
  green: boolean
}) {
  const { top, x } = hook(doorNumber)
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
    >
      <span
        className={clsx(
          "absolute inset-0 transition-[translate] duration-700",
          lifted ? "-translate-y-full ease-in" : "translate-y-0 ease-out",
        )}
      >
        <span
          className="door-hanger absolute inset-0"
          style={{ animationDelay: `${-((doorNumber * 1.7) % 5)}s` }}
        >
          <span className={NUMBER_ON_DOOR}>
            {/* The string runs from the top edge down to the very top of
                the digits, where the little ring holds them. */}
            <span
              className={clsx(
                "absolute h-[20em] w-[1.5px] -translate-x-1/2",
                green
                  ? "bg-[#1f4a2c] shadow-[0_0_1px_rgb(0_0_0/0.4)]"
                  : "bg-[#e8d9b0] shadow-[0_0_2px_rgb(0_0_0/0.6)]",
              )}
              style={{
                left: `calc(50% + ${x}em)`,
                bottom: `calc(100% - ${top - 0.1}em)`,
              }}
            />
            <span
              className={clsx(
                "absolute h-[0.17em] w-[0.17em] -translate-x-1/2 rounded-full border-[1.5px]",
                green ? "border-[#24502f]" : "border-[#d9b25a]",
              )}
              style={{
                left: `calc(50% + ${x}em)`,
                top: `${top - 0.12}em`,
              }}
            />
            {doorNumber}
          </span>
        </span>
      </span>
    </span>
  )
}

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

/** The number floats freely; it flies up with a few sparkling stars. */
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
        <span
          className="door-float absolute inset-0"
          style={{ animationDelay: `${-((doorNumber * 1.3) % 4)}s` }}
        >
          <span className={NUMBER_ON_DOOR}>{doorNumber}</span>
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

/**
 * A little wrought-iron lantern with a snow cap and a candle, the door
 * number painted on its glass. Drawn by hand, lines a little wobbly.
 */
export function Lantern({
  doorNumber,
  bright = false,
  className,
}: {
  doorNumber: number
  bright?: boolean
  className?: string
}) {
  const id = useId().replace(/:/g, "")
  const iron = "#2c211c"
  const ironLight = "#6b5143"
  const outline = "#170f0b"
  return (
    <svg
      viewBox="-8 -4 116 192"
      className={clsx("block h-auto w-full overflow-visible", className)}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor="#ffe9a3" stopOpacity="1" />
          <stop offset="0.5" stopColor="#f7c35f" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f7c35f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-glass`} cx="0.5" cy="0.68" r="0.75">
          <stop offset="0" stopColor="#fff6c9" />
          <stop offset="0.35" stopColor="#fbd57e" />
          <stop offset="0.8" stopColor="#e39b45" />
          <stop offset="1" stopColor="#b7672c" />
        </radialGradient>
        <linearGradient id={`${id}-snow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d7e4f2" />
        </linearGradient>
        {/* Makes the ink lines a little uneven, as if drawn by hand. */}
        <filter id={`${id}-hand`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.045"
            numOctaves="2"
            seed={doorNumber}
          />
          <feDisplacementMap in="SourceGraphic" scale="3" />
        </filter>
      </defs>

      {/* Warm light around the lantern. */}
      <circle
        cx="50"
        cy="104"
        r="72"
        fill={`url(#${id}-halo)`}
        className={clsx("lantern-halo", bright && "lantern-halo-bright")}
      />

      <g
        filter={`url(#${id}-hand)`}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Hanging ring and knob. */}
        <ellipse
          cx="50"
          cy="10"
          rx="7"
          ry="6.5"
          fill="none"
          stroke={outline}
          strokeWidth="4.2"
        />
        <ellipse
          cx="50"
          cy="10"
          rx="7"
          ry="6.5"
          fill="none"
          stroke={ironLight}
          strokeWidth="1.4"
        />
        <circle
          cx="50"
          cy="20"
          r="4"
          fill={iron}
          stroke={outline}
          strokeWidth="1.6"
        />

        {/* Roof, bent a little like a bell. */}
        <path
          d="M50 22 C44 30 31 39 18 46.5 L82 46.5 C69 39 56 30 50 22Z"
          fill={iron}
          stroke={outline}
          strokeWidth="2"
        />
        <path
          d="M49 26 C45 32 37 38 28 43"
          fill="none"
          stroke={ironLight}
          strokeWidth="1.4"
        />
        {/* Eave. */}
        <rect
          x="13"
          y="45.5"
          width="74"
          height="7"
          rx="3"
          fill={iron}
          stroke={outline}
          strokeWidth="2"
        />
        <path d="M17 48 L83 48" stroke={ironLight} strokeWidth="1.1" />
        {/* Snow cap on the roof, spilling over the eave. */}
        <path
          d="M24 43 C34 37 43 30 50 23.5 C57 30 66 37 77 43 C82 45 85 48 83 50.5 C81 52.5 79 50 77.5 52.5 C76 56 72.5 56 72 52 C69 50.5 64 51.5 60 51 C55 50.5 52 52.5 48 51.5 C43 50.5 38 52 33 51 C31 54.5 27.5 54.5 27 51 C24 52 18 51.5 17 49 C16.5 46.5 20 44.5 24 43Z"
          fill={`url(#${id}-snow)`}
          stroke="#a9bdd3"
          strokeWidth="0.9"
        />
        <path
          d="M36 38 C41 35 45 31 49 27.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.6"
        />

        {/* Glass with the candle light. */}
        <path d="M23 53 L77 53 L75 135 L25 135Z" fill={`url(#${id}-glass)`} />
        <path
          d="M23 53 L77 53 L75 135 L25 135Z"
          fill="#fff8d6"
          className={clsx("lantern-glass", bright && "lantern-glass-bright")}
        />
        {/* Candle. */}
        <rect
          x="44.5"
          y="113"
          width="11"
          height="22"
          rx="2"
          fill="#fbf3e2"
          stroke="#c9a77a"
          strokeWidth="0.9"
        />
        <path d="M50 113 L50 109.5" stroke={outline} strokeWidth="1" />
        <g className={clsx("lantern-flame", bright && "lantern-flame-bright")}>
          <path
            d="M50 96 C54.5 102 55 106 50 110 C45 106 45.5 102 50 96Z"
            fill="#ffe27a"
          />
          <path
            d="M50 101.5 C52 104 52.2 106 50 108 C47.8 106 48 104 50 101.5Z"
            fill="#fff8de"
          />
        </g>
        {/* The door number, painted on the glass. */}
        <text
          x="50"
          y="88"
          textAnchor="middle"
          fontSize={doorNumber >= 10 ? 33 : 38}
          className="font-door"
          fill="#6e2414"
          stroke="#fff3cf"
          strokeWidth="2.4"
          paintOrder="stroke"
        >
          {doorNumber}
        </text>
        {/* A glint on the glass. */}
        <path
          d="M29 60 C28.5 72 28.5 84 29.5 96"
          stroke="#fffbea"
          strokeOpacity="0.7"
          strokeWidth="2.2"
          fill="none"
        />

        {/* Iron frame around the glass. */}
        <path
          d="M23 53 L77 53 L75 135 L25 135Z"
          fill="none"
          stroke={outline}
          strokeWidth="3.4"
        />
        <path d="M23 53 L25 135" stroke={iron} strokeWidth="5.5" />
        <path d="M77 53 L75 135" stroke={iron} strokeWidth="5.5" />
        <path d="M22.4 56 L24 131" stroke={ironLight} strokeWidth="1.2" />
        <path d="M76.4 56 L74.8 131" stroke={ironLight} strokeWidth="1" />
        {/* Little curl under the eave on each side. */}
        <path
          d="M27 53 C27 59 33 59 33 55"
          fill="none"
          stroke={outline}
          strokeWidth="1.8"
        />
        <path
          d="M73 53 C73 59 67 59 67 55"
          fill="none"
          stroke={outline}
          strokeWidth="1.8"
        />

        {/* Base and feet. */}
        <path
          d="M18 134 L82 134 L78 145 L22 145Z"
          fill={iron}
          stroke={outline}
          strokeWidth="2"
        />
        <path d="M22 137.5 L78 137.5" stroke={ironLight} strokeWidth="1.1" />
        <path
          d="M25 145 L23 152 L31 152 L31 145"
          fill={iron}
          stroke={outline}
          strokeWidth="1.8"
        />
        <path
          d="M75 145 L77 152 L69 152 L69 145"
          fill={iron}
          stroke={outline}
          strokeWidth="1.8"
        />

        {/* A snowy patch and a holly sprig at its foot. */}
        <path
          d="M0 156 C10 149 26 151 40 152.5 C56 150 76 149 100 155 C92 161 70 162 50 161 C30 162 10 161 0 156Z"
          fill={`url(#${id}-snow)`}
          stroke="#b8c9dc"
          strokeWidth="0.8"
        />
        <path
          d="M4 150 C9 140 18 139 22 147 C17 145 15 150 10 148 C9 152 6 152 4 150Z"
          fill="#2f6b3a"
          stroke="#173a1e"
          strokeWidth="1.3"
        />
        <path
          d="M8 154 C2 147 3 138 12 138 C10 143 15 145 12 149 C15 151 12 154 8 154Z"
          fill="#3d7d46"
          stroke="#173a1e"
          strokeWidth="1.3"
        />
        <path d="M7 150 L15 142" stroke="#173a1e" strokeWidth="0.8" />
        <circle
          cx="15"
          cy="150"
          r="3.2"
          fill="#c62f2f"
          stroke="#6f1515"
          strokeWidth="1"
        />
        <circle
          cx="20"
          cy="152"
          r="2.8"
          fill="#d53b3b"
          stroke="#6f1515"
          strokeWidth="1"
        />
        <circle
          cx="17.5"
          cy="146"
          r="2.6"
          fill="#b52626"
          stroke="#6f1515"
          strokeWidth="1"
        />
        <circle cx="14" cy="149" r="0.9" fill="#ffd9d9" />
      </g>
    </svg>
  )
}
