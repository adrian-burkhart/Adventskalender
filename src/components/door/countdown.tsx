"use client"

import clsx from "clsx"
import { memo, useEffect, useRef, useState } from "react"
import { QUESTION_SECONDS } from "@/lib/doors"
import { useDesign, type DesignChoice } from "@/lib/design-variants"

export type CountdownVariant = DesignChoice<"countdown">

function msLeft(deadline: number) {
  return Math.max(0, deadline - Date.now())
}

/** The last seconds glow warmer, without turning into an alarm. */
const HURRY_SECONDS = 10

interface ViewProps {
  /** Whole seconds left, as shown. */
  seconds: number
  /** 1 at the start, 0 when the time is up. */
  fraction: number
}

/** Counts down to the server's deadline, so a reload doesn't reset it. */
const Countdown = memo(
  ({
    deadline,
    onComplete,
    isSubmitted,
    variant,
  }: {
    deadline: number
    isSubmitted: boolean
    onComplete: () => void
    /** Overrides the chosen design (for /vorschau). */
    variant?: CountdownVariant
  }) => {
    const chosen = useDesign("countdown")
    const [left, setLeft] = useState(() => msLeft(deadline))
    const onCompleteRef = useRef(onComplete)

    useEffect(() => {
      onCompleteRef.current = onComplete
    }, [onComplete])

    useEffect(() => {
      if (isSubmitted) return
      const tick = () => {
        const now = msLeft(deadline)
        setLeft(now)
        if (now === 0) {
          clearInterval(timer)
          onCompleteRef.current()
        }
      }
      const timer = setInterval(tick, 100)
      return () => clearInterval(timer)
    }, [deadline, isSubmitted])

    const seconds = Math.ceil(left / 1000)
    const fraction = Math.min(1, left / (QUESTION_SECONDS * 1000))
    return (
      <CountdownView
        variant={variant ?? chosen}
        seconds={seconds}
        fraction={fraction}
      />
    )
  },
)

export function CountdownView({
  variant,
  ...props
}: ViewProps & { variant: CountdownVariant }) {
  return (
    <div
      role="timer"
      aria-label={`Noch ${props.seconds} Sekunden`}
      className="flex flex-col items-center"
    >
      {variant === "kranz" ? (
        <Wreath {...props} />
      ) : variant === "lichterkette" ? (
        <FairyLights {...props} />
      ) : (
        <Candle {...props} />
      )}
    </div>
  )
}

function Seconds({ seconds }: { seconds: number }) {
  const hurry = seconds <= HURRY_SECONDS
  return (
    <div aria-hidden className="text-center leading-none">
      <span
        className={clsx(
          "font-display text-5xl tabular-nums transition-colors duration-500",
          hurry ? "text-[#ffb37a]" : "text-candle",
        )}
      >
        {seconds}
      </span>
      <span className="ml-2 text-base text-candle/80">
        {seconds === 1 ? "Sekunde" : "Sekunden"}
      </span>
    </div>
  )
}

// --- Proposal 1: a candle that burns down -----------------------------------

function Candle({ seconds, fraction }: ViewProps) {
  const hurry = seconds <= HURRY_SECONDS
  // The wax shrinks from 120 to 14 units; the flame sits on top of it.
  const wax = 14 + 106 * fraction
  const top = 170 - wax
  return (
    <div className="flex items-end gap-4">
      <svg viewBox="0 0 120 200" className="h-52 w-auto" aria-hidden>
        <defs>
          <radialGradient id="candle-halo">
            <stop offset="0%" stopColor="#ffe9a8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#ffe9a8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="candle-flame" cx="50%" cy="70%" r="60%">
            <stop offset="0%" stopColor="#fffbe6" />
            <stop offset="45%" stopColor="#ffd25e" />
            <stop offset="100%" stopColor="#ff8a1f" />
          </radialGradient>
          <linearGradient id="candle-wax" x1="0" x2="1">
            <stop offset="0%" stopColor="#a61e1e" />
            <stop offset="45%" stopColor="#d43c3c" />
            <stop offset="100%" stopColor="#8e1d1d" />
          </linearGradient>
        </defs>
        {fraction > 0 && (
          <circle
            cx="60"
            cy={top - 14}
            r="42"
            fill="url(#candle-halo)"
            className="countdown-halo"
          />
        )}
        <rect
          x="40"
          y={top}
          width="40"
          height={wax}
          rx="4"
          fill="url(#candle-wax)"
        />
        {/* A drop of wax running down. */}
        <path
          d={`M48 ${top} q0 10 3 14 q3 -4 3 -14 z`}
          fill="#e25555"
          opacity="0.9"
        />
        <line
          x1="60"
          y1={top}
          x2="60"
          y2={top - 6}
          stroke="#3b2a1a"
          strokeWidth="2"
        />
        {fraction > 0 && (
          <g
            className={clsx(
              "countdown-flame",
              hurry && "countdown-flame-hurry",
            )}
            style={{ transformOrigin: `60px ${top - 4}px` }}
          >
            <path
              d={`M60 ${top - 32} C70 ${top - 18} 68 ${top - 4} 60 ${top - 3} C52 ${top - 4} 50 ${top - 18} 60 ${top - 32} Z`}
              fill="url(#candle-flame)"
            />
          </g>
        )}
        {/* Holder with a fir sprig and berries. */}
        <ellipse cx="60" cy="176" rx="46" ry="10" fill="#b8862b" />
        <ellipse cx="60" cy="172" rx="38" ry="7" fill="#e9c46a" />
        <path
          d="M14 176 q20 -16 40 -6 M106 176 q-20 -16 -40 -6"
          stroke="#2f6b3a"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="26" cy="172" r="4" fill="#c62f2f" />
        <circle cx="33" cy="176" r="3.5" fill="#c62f2f" />
        <circle cx="92" cy="171" r="4" fill="#c62f2f" />
      </svg>
      <Seconds seconds={seconds} />
    </div>
  )
}

// --- Proposal 2: a golden ring closes around an advent wreath ---------------

function Wreath({ seconds, fraction }: ViewProps) {
  const r = 78
  const circumference = 2 * Math.PI * r
  const hurry = seconds <= HURRY_SECONDS
  const berries = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2)
  return (
    <svg viewBox="0 0 200 200" className="h-52 w-52" aria-hidden>
      {/* Fir needles: two dashed rings of green. */}
      <circle
        cx="100"
        cy="100"
        r={r}
        fill="none"
        stroke="#1f5a30"
        strokeWidth="26"
      />
      <circle
        cx="100"
        cy="100"
        r={r}
        fill="none"
        stroke="#2f7a40"
        strokeWidth="20"
        strokeDasharray="3 5"
      />
      <circle
        cx="100"
        cy="100"
        r={r - 9}
        fill="none"
        stroke="#3c8f4e"
        strokeWidth="5"
        strokeDasharray="2 6"
      />
      <circle
        cx="100"
        cy="100"
        r={r + 9}
        fill="none"
        stroke="#3c8f4e"
        strokeWidth="5"
        strokeDasharray="2 7"
      />
      {berries.map((angle, i) => (
        <circle
          key={i}
          cx={100 + Math.cos(angle) * (r + (i % 2 ? 6 : -6))}
          cy={100 + Math.sin(angle) * (r + (i % 2 ? 6 : -6))}
          r="4"
          fill="#c62f2f"
        />
      ))}
      {/* The golden ribbon that runs out with the time. */}
      <circle
        cx="100"
        cy="100"
        r={r}
        fill="none"
        stroke={hurry ? "#ffb37a" : "#e9c46a"}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        transform="rotate(-90 100 100)"
        style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.5s" }}
        filter="drop-shadow(0 0 4px rgba(254,240,138,.7))"
      />
      {/* A bow at the bottom. */}
      <path
        d="M100 178 l-16 -10 l0 20 z M100 178 l16 -10 l0 20 z"
        fill="#c62f2f"
      />
      <circle cx="100" cy="178" r="4.5" fill="#8e1d1d" />
      <text
        x="100"
        y="104"
        textAnchor="middle"
        className="font-display"
        fontSize="50"
        fill={hurry ? "#ffb37a" : "#fef08a"}
      >
        {seconds}
      </text>
      <text
        x="100"
        y="128"
        textAnchor="middle"
        fontSize="13"
        fill="#fef08acc"
        className="font-body"
      >
        {seconds === 1 ? "Sekunde" : "Sekunden"}
      </text>
    </svg>
  )
}

// --- Proposal 3: a string of fairy lights, one goes out every second --------

const BULB_COLORS = ["#ff6b6b", "#ffd166", "#7bd389", "#ffb37a", "#8ecae6"]

function FairyLights({ seconds }: ViewProps) {
  // Two garlands of 15 bulbs each, hanging in a gentle curve.
  const rows = [0, 1]
  const perRow = Math.ceil(QUESTION_SECONDS / rows.length)
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 320 130" className="w-full max-w-[26rem]" aria-hidden>
        {rows.map((row) => {
          const y0 = 14 + row * 58
          return (
            <g key={row}>
              <path
                d={`M4 ${y0} Q160 ${y0 + 44} 316 ${y0}`}
                fill="none"
                stroke="#1c3b26"
                strokeWidth="2.5"
              />
              {Array.from({ length: perRow }, (_, i) => {
                const index = row * perRow + i
                const t = (i + 0.5) / perRow
                // A point on the quadratic curve above.
                const x =
                  (1 - t) * (1 - t) * 4 + 2 * (1 - t) * t * 160 + t * t * 316
                const y =
                  (1 - t) * (1 - t) * y0 +
                  2 * (1 - t) * t * (y0 + 44) +
                  t * t * y0
                const lit = index < seconds
                const color = BULB_COLORS[index % BULB_COLORS.length]
                const sway = i % 2 ? 8 : -8
                return (
                  <g key={i} transform={`rotate(${sway / 2} ${x} ${y})`}>
                    <rect
                      x={x - 3}
                      y={y - 1}
                      width="6"
                      height="5"
                      rx="1"
                      fill="#2b2b2b"
                    />
                    <ellipse
                      cx={x}
                      cy={y + 11}
                      rx="6"
                      ry="8.5"
                      fill={lit ? color : "#3f4a44"}
                      opacity={lit ? 1 : 0.7}
                      style={{
                        transition: "fill .4s, filter .4s",
                        filter: lit ? `drop-shadow(0 0 5px ${color})` : "none",
                      }}
                      className={lit ? "countdown-twinkle" : undefined}
                    />
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
      <Seconds seconds={seconds} />
    </div>
  )
}

export default Countdown
