"use client"

import clsx from "clsx"
import { memo, useEffect, useRef, type CSSProperties } from "react"
import { useDesign, type DesignChoice } from "@/lib/design-variants"
import { DrawnWichtel, RED_WICHTEL } from "./drawn-wichtel"
import solutionImage from "../../../public/images/solution.webp"
import shrugImage from "../../../public/images/shrug.webp"

export type AnticipationVariant = DesignChoice<"present">

/**
 * How long the jingle at the start of the outro audio runs, from the moment
 * the audio starts (it opens with up to a second of silence). The result
 * shows when it ends, as the gift used to.
 */
export const JINGLE_MS = 7000

/**
 * What happens while the jingle plays, in anticipation of the result. It
 * runs on its own; all timings are in the CSS (.anticipation-*).
 */
const Anticipation = memo(
  ({
    isCorrect,
    started,
    onDone,
    variant,
  }: {
    /** For the snow globe: the Wichtel inside cheers or shrugs. */
    isCorrect: boolean
    /** True once the outro audio plays (or without it, right away). */
    started: boolean
    onDone: () => void
    /** Overrides the chosen design (for /vorschau). */
    variant?: AnticipationVariant
  }) => {
    const chosen = useDesign("present")
    const which = variant ?? chosen
    const onDoneRef = useRef(onDone)
    useEffect(() => {
      onDoneRef.current = onDone
    }, [onDone])

    useEffect(() => {
      if (!started) return
      const timer = setTimeout(() => onDoneRef.current(), JINGLE_MS)
      return () => clearTimeout(timer)
    }, [started])

    return (
      <div
        aria-live="polite"
        className={clsx(
          "flex h-80 w-full max-w-sm items-center justify-center",
          started && "anticipation-playing",
        )}
      >
        <span className="sr-only">Gleich kommt die Auflösung …</span>
        {which === "schneekugel" ? (
          <SnowGlobe isCorrect={isCorrect} />
        ) : which === "geschenk" ? (
          <PaintedPresent />
        ) : (
          <WichtelWithPresent />
        )}
      </div>
    )
  },
)

/** A soft blur and a slightly uneven edge, like a brush. */
function PaintFilter({ id, scale = 2 }: { id: string; scale?: number }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.06"
        numOctaves="2"
        seed="7"
      />
      <feDisplacementMap in="SourceGraphic" scale={scale} />
      <feGaussianBlur stdDeviation="0.8" />
    </filter>
  )
}

/** The present itself, in box coordinates (0 0 60 56). */
function Box({ id }: { id: string }) {
  return (
    <g>
      <defs>
        <radialGradient id={`box-${id}`} cx="30%" cy="25%" r="90%">
          <stop offset="0%" stopColor="#d9655a" />
          <stop offset="55%" stopColor="#b23a30" />
          <stop offset="100%" stopColor="#7d2420" />
        </radialGradient>
        <radialGradient id={`light-${id}`} cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#fff6c8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        className="anticipation-glow"
        cx="30"
        cy="14"
        rx="40"
        ry="30"
        fill={`url(#light-${id})`}
      />
      <path d="M4 18 L56 18 L54 56 L6 56 Z" fill={`url(#box-${id})`} />
      <rect x="26" y="18" width="8" height="38" fill="#ecd08a" />
      <g className="anticipation-lid">
        <path
          d="M0 8 Q30 5 60 8 L59 20 Q30 22 1 20 Z"
          fill={`url(#box-${id})`}
        />
        <rect x="26" y="7" width="8" height="14" fill="#ecd08a" />
        <path
          d="M30 8 C20 -8 8 0 14 8 C18 11 26 10 30 8 Z M30 8 C40 -8 52 0 46 8 C42 11 34 10 30 8 Z"
          fill="#ecd08a"
        />
        <ellipse cx="30" cy="8" rx="4" ry="3.5" fill="#b9944a" />
      </g>
    </g>
  )
}

// --- Proposal 1: a Wichtel brings the present -------------------------------

function WichtelWithPresent() {
  return (
    <svg
      viewBox="0 0 300 220"
      className="h-full w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <PaintFilter id="paint-carry" />
      </defs>
      <ellipse
        cx="150"
        cy="208"
        rx="140"
        ry="10"
        fill="#e9eff6"
        opacity="0.18"
      />
      <g className="anticipation-carry">
        <g className="anticipation-steps" filter="url(#paint-carry)">
          <g transform="translate(66 38) scale(1.1)">
            <DrawnWichtel look={RED_WICHTEL} lookDown />
            {/* The present in his hands. */}
            {/* The wobble is a CSS transform, so the position sits on
                a wrapper (CSS would replace it). */}
            <g transform="translate(96 82)">
              <g className="anticipation-box">
                <Box id="carry" />
              </g>
            </g>
            <ellipse
              cx="100"
              cy="114"
              rx="7"
              ry="6"
              fill={RED_WICHTEL.mittens}
            />
            <ellipse
              cx="99"
              cy="128"
              rx="7"
              ry="6"
              fill={RED_WICHTEL.mittens}
            />
          </g>
        </g>
      </g>
      <RisingFlakes x={222} y={120} />
    </svg>
  )
}

// --- Proposal 2: the painted present opens by itself -------------------------

function PaintedPresent() {
  return (
    <svg
      viewBox="0 0 200 220"
      className="h-full w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <PaintFilter id="paint-present" />
      </defs>
      <ellipse cx="100" cy="206" rx="70" ry="8" fill="black" opacity="0.28" />
      <g className="anticipation-box" filter="url(#paint-present)">
        <g transform="translate(30 92) scale(2.33)">
          <Box id="alone" />
        </g>
      </g>
      <RisingFlakes x={100} y={100} />
    </svg>
  )
}

// --- Proposal 3: a snow globe settles and shows the Wichtel ------------------

/** Same numbers on every render. */
function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

const GLOBE_FLAKES = (() => {
  const random = seeded(17)
  const inside = () => {
    // A random point in the globe (radius 80 around 110/110).
    const angle = random() * Math.PI * 2
    const radius = Math.sqrt(random()) * 72
    return [110 + Math.cos(angle) * radius, 110 + Math.sin(angle) * radius]
  }
  return Array.from({ length: 70 }, () => {
    const [x0, y0] = inside()
    const [x1, y1] = inside()
    const [x2, y2] = inside()
    // Where it settles: on the ground of the globe.
    const x3 = 50 + random() * 120
    const y3 = 176 + random() * 12 - Math.abs(x3 - 110) * 0.12
    return {
      r: 1.2 + random() * 1.8,
      style: {
        "--x0": `${x0}px`,
        "--y0": `${y0}px`,
        "--x1": `${x1}px`,
        "--y1": `${y1}px`,
        "--x2": `${x2}px`,
        "--y2": `${y2}px`,
        "--x3": `${x3}px`,
        "--y3": `${y3}px`,
        animationDelay: `${-random() * 0.4}s`,
      } as CSSProperties,
    }
  })
})()

function SnowGlobe({ isCorrect }: { isCorrect: boolean }) {
  const wichtel = isCorrect ? solutionImage : shrugImage
  return (
    <svg
      viewBox="0 0 220 260"
      className="h-full w-auto overflow-visible"
      aria-hidden
    >
      <defs>
        <clipPath id="globe-inside">
          <circle cx="110" cy="110" r="88" />
        </clipPath>
        <radialGradient id="globe-water" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#2c6b4a" />
          <stop offset="100%" stopColor="#0d2f1d" />
        </radialGradient>
        <radialGradient id="globe-glass" cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="45%" stopColor="white" stopOpacity="0.05" />
          <stop offset="100%" stopColor="white" stopOpacity="0.15" />
        </radialGradient>
        <linearGradient id="globe-wood" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#9a6a40" />
          <stop offset="100%" stopColor="#5a3820" />
        </linearGradient>
        <PaintFilter id="paint-globe" scale={1.5} />
      </defs>
      <g className="anticipation-shake">
        {/* The wooden base. */}
        <g filter="url(#paint-globe)">
          <path
            d="M46 186 Q110 176 174 186 L190 238 Q110 252 30 238 Z"
            fill="url(#globe-wood)"
          />
          <path
            d="M40 206 Q110 198 180 206 L182 214 Q110 206 38 214 Z"
            fill="#e9c46a"
            opacity="0.85"
          />
        </g>
        <g clipPath="url(#globe-inside)">
          <rect x="0" y="0" width="220" height="220" fill="url(#globe-water)" />
          <ellipse cx="110" cy="196" rx="90" ry="22" fill="#eef3f8" />
          <image
            href={wichtel.src}
            x="58"
            y="62"
            width="104"
            height={(104 * wichtel.height) / wichtel.width}
          />
          {/* Swirling snow hides him at first and settles at the end. */}
          <circle
            className="anticipation-frost"
            cx="110"
            cy="110"
            r="88"
            fill="#f4f8fb"
          />
          {GLOBE_FLAKES.map((flake, i) => (
            <circle
              key={i}
              className="globe-flake"
              r={flake.r}
              fill="white"
              style={flake.style}
            />
          ))}
        </g>
        <circle cx="110" cy="110" r="88" fill="url(#globe-glass)" />
        <circle
          cx="110"
          cy="110"
          r="88"
          fill="none"
          stroke="white"
          strokeOpacity="0.35"
          strokeWidth="2"
        />
        <path
          d="M58 60 Q74 40 100 34"
          stroke="white"
          strokeOpacity="0.55"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  )
}

/** A few soft flakes that float up out of the opened present. */
function RisingFlakes({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {Array.from({ length: 8 }, (_, i) => (
        <circle
          key={i}
          className="anticipation-flake"
          cx={x - 24 + ((i * 13) % 48)}
          cy={y}
          r={2 + (i % 3)}
          fill="white"
          style={
            {
              "--drift": `${(i % 2 ? 1 : -1) * (6 + ((i * 7) % 14))}px`,
              animationDelay: `${6.5 + i * 0.05}s`,
            } as CSSProperties
          }
        />
      ))}
    </g>
  )
}

export default Anticipation
