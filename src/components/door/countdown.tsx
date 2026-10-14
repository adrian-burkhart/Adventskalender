"use client"

import clsx from "clsx"
import Image from "next/image"
import { memo, useEffect, useRef, useState } from "react"
import { QUESTION_SECONDS } from "@/lib/doors"
import thinkingImage from "../../../public/images/thinking.webp"

function msLeft(deadline: number) {
  return Math.max(0, deadline - Date.now())
}

/** The last seconds glow warmer, without turning into an alarm. */
const HURRY_SECONDS = 10

/** Counts down to the server's deadline, so a reload doesn't reset it. */
const Countdown = memo(
  ({
    deadline,
    onComplete,
    isSubmitted,
  }: {
    deadline: number
    isSubmitted: boolean
    onComplete: () => void
  }) => {
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
    return <SnowmanCountdown seconds={seconds} fraction={fraction} />
  },
)

/** 0 before a part starts, 1 once it's done. */
function stage(progress: number, from: number, to: number) {
  return Math.min(1, Math.max(0, (progress - from) / (to - from)))
}

/**
 * The Wichtel thinks while a snowman gets built next to him: the bottom,
 * the middle, the head, then nose, buttons, hat and scarf. When the snowman
 * is finished, the time is up.
 */
export function SnowmanCountdown({
  seconds,
  fraction,
}: {
  /** Whole seconds left, as shown. */
  seconds: number
  /** 1 at the start, 0 when the time is up. */
  fraction: number
}) {
  const progress = 1 - fraction
  const bottom = stage(progress, 0, 0.3)
  const middle = stage(progress, 0.3, 0.55)
  const head = stage(progress, 0.55, 0.75)
  const face = stage(progress, 0.75, 0.85)
  const hat = stage(progress, 0.85, 0.95)
  const scarf = stage(progress, 0.92, 1)
  const hurry = seconds <= HURRY_SECONDS

  // A ball grows from small to full size while it is being rolled.
  const ball = (cx: number, cy: number, r: number, amount: number) =>
    amount > 0 && (
      <g
        style={{
          transform: `scale(${0.35 + 0.65 * amount})`,
          transformOrigin: `${cx}px ${cy + r}px`,
          opacity: Math.min(1, amount * 3),
        }}
      >
        <circle cx={cx} cy={cy} r={r} fill="url(#snowball)" />
      </g>
    )

  const snowman = (
    <g>
      {ball(200, 142, 32, bottom)}
      {ball(200, 92, 23, middle)}
      {ball(200, 54, 17, head)}
      {face > 0 && (
        <g opacity={face}>
          <circle cx="194" cy="50" r="2.2" fill="#2b2b2b" />
          <circle cx="206" cy="50" r="2.2" fill="#2b2b2b" />
          <path d="M200 56 l14 3 l-14 2 z" fill="#e8812d" />
          <circle cx="200" cy="84" r="2.6" fill="#2b2b2b" />
          <circle cx="200" cy="96" r="2.6" fill="#2b2b2b" />
          <circle cx="200" cy="133" r="2.8" fill="#2b2b2b" />
        </g>
      )}
      {hat > 0 && (
        <g
          style={{
            transform: `translateY(${(1 - hat) * -30}px)`,
            opacity: hat,
          }}
        >
          {/* A red Wichtel hat with a white rim. */}
          <path d="M184 40 Q200 2 228 12 Q212 18 216 40 Z" fill="#c0392b" />
          <ellipse cx="200" cy="40" rx="18" ry="5" fill="#f3f3f3" />
          <circle cx="229" cy="13" r="4.5" fill="#f3f3f3" />
        </g>
      )}
      {scarf > 0 && (
        <g opacity={scarf}>
          <path
            d="M182 70 Q200 78 218 70 L218 76 Q200 84 182 76 Z"
            fill="#2f7a40"
          />
          <path d="M210 76 l6 20 l-7 1 l-4 -19 z" fill="#2f7a40" />
        </g>
      )}
    </g>
  )

  return (
    <div
      role="timer"
      aria-label={`Noch ${seconds} Sekunden`}
      className="flex items-end justify-center gap-3 md:flex-col md:items-center md:gap-1"
    >
      <div className="relative h-32 w-50 shrink-0 md:h-48 md:w-76">
        <svg
          viewBox="0 0 300 190"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden
        >
          <defs>
            {/* Soft, slightly uneven edges like the painted pictures. */}
            <filter id="painted" x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.06"
                numOctaves="2"
                seed="3"
              />
              <feDisplacementMap in="SourceGraphic" scale="3" />
              <feGaussianBlur stdDeviation="0.7" />
            </filter>
            <radialGradient id="snowball" cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="55%" stopColor="#e9eff6" />
              <stop offset="100%" stopColor="#a9bccf" />
            </radialGradient>
            <radialGradient id="snowbank" cx="50%" cy="20%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#c7d5e3" />
            </radialGradient>
          </defs>
          <g filter="url(#painted)">
            {/* Snow on the ground. */}
            <ellipse
              cx="160"
              cy="180"
              rx="150"
              ry="16"
              fill="url(#snowbank)"
              opacity="0.95"
            />
            {snowman}
          </g>
        </svg>
        <Image
          src={thinkingImage}
          alt=""
          priority
          className={clsx(
            "wichtel-rock absolute bottom-[-7%] left-[5%] h-auto w-[42%]",
            hurry && "wichtel-rock-hurry",
          )}
        />
      </div>
      <div
        aria-hidden
        className="flex flex-col items-center pb-2 text-center leading-none md:block md:pb-0"
      >
        <span
          className={clsx(
            "font-door text-5xl tabular-nums transition-colors duration-500",
            hurry ? "text-[#ffb37a]" : "text-candle",
          )}
        >
          {seconds}
        </span>
        <span className="text-base text-candle/80 md:ml-2">
          {seconds === 1 ? "Sekunde" : "Sekunden"}
        </span>
      </div>
    </div>
  )
}

export default Countdown
