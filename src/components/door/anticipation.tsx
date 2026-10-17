"use client"

import clsx from "clsx"
import { memo, useEffect, useRef, type CSSProperties } from "react"
import giftWichtel from "../../../public/images/gift-wichtel.webp"

/**
 * How long the jingle at the start of the outro audio runs, from the moment
 * the audio starts (it opens with up to a second of silence). The result
 * shows when it ends, as the gift used to.
 */
export const JINGLE_MS = 7000

/**
 * While the jingle plays, a Wichtel carries in a present, looks at it as it
 * wiggles more and more, and at the very end its lid pops open. It runs on
 * its own; all timings are in the CSS (.anticipation-*).
 */
const Anticipation = memo(
  ({
    started,
    onDone,
  }: {
    /** True once the outro audio plays (or without it, right away). */
    started: boolean
    onDone: () => void
  }) => {
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
        <WichtelWithPresent />
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

// --- A Wichtel brings the present -------------------------------------------

/** The painted Wichtel, drawn at this height in the SVG. */
const WICHTEL_HEIGHT = 190
const WICHTEL_WIDTH = (WICHTEL_HEIGHT * giftWichtel.width) / giftWichtel.height
const WICHTEL_X = 72
const WICHTEL_Y = 14
/** The present sits on his raised mitten, at this scale and spot. */
const BOX_SCALE = 0.72
const BOX_X = 201 - 30 * BOX_SCALE
const BOX_Y = 102 - 56 * BOX_SCALE

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
        <g className="anticipation-steps">
          <ellipse
            cx={WICHTEL_X + WICHTEL_WIDTH / 2}
            cy={WICHTEL_Y + WICHTEL_HEIGHT - 2}
            rx="46"
            ry="5"
            fill="black"
            opacity="0.25"
          />
          <image
            href={giftWichtel.src}
            x={WICHTEL_X}
            y={WICHTEL_Y}
            width={WICHTEL_WIDTH}
            height={WICHTEL_HEIGHT}
          />
          {/* The present on his raised mitten. The wobble is a CSS
              transform, so the position sits on a wrapper (CSS would
              replace it). */}
          <g
            transform={`translate(${BOX_X} ${BOX_Y}) scale(${BOX_SCALE})`}
            filter="url(#paint-carry)"
          >
            <g className="anticipation-box">
              <Box id="carry" />
            </g>
          </g>
        </g>
      </g>
      <RisingStars x={201} y={66} />
    </svg>
  )
}

/** A five-pointed star around (cx, cy), as an SVG path. */
function starPath(cx: number, cy: number, r: number) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const radius = i % 2 ? r * 0.45 : r
    return `${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`
  })
  return `M${points.join(" L")} Z`
}

/** A few little golden stars that float up out of the opened present. */
function RisingStars({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {Array.from({ length: 8 }, (_, i) => (
        <path
          key={i}
          className="anticipation-star"
          d={starPath(x - 24 + ((i * 13) % 48), y, 3.5 + (i % 3) * 1.2)}
          fill={i % 3 ? "#fde68a" : "#ffffff"}
          stroke="#ecd08a"
          strokeWidth="0.5"
          strokeLinejoin="round"
          style={
            {
              "--drift": `${(i % 2 ? 1 : -1) * (6 + ((i * 7) % 14))}px`,
              "--spin": `${(i % 2 ? 1 : -1) * (40 + ((i * 17) % 60))}deg`,
              animationDelay: `${6.5 + i * 0.05}s`,
            } as CSSProperties
          }
        />
      ))}
    </g>
  )
}

export default Anticipation
