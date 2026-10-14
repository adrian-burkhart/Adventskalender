"use client"

import clsx from "clsx"
import Image from "next/image"
import { memo, useEffect, useRef, useState, type CSSProperties } from "react"
import { useDesign, type DesignChoice } from "@/lib/design-variants"
import { jingle, sparkle } from "@/lib/chime"
import star from "../../../public/images/star.webp"

export type PresentVariant = DesignChoice<"present">

/** How long the opening plays before the result shows. */
const OPEN_MS = 1900

type Phase = "idle" | "opening"

/**
 * The present after answering. It waits for a tap (it no longer opens on its
 * own) and then opens with light and stars before the result shows.
 */
const Present = memo(
  ({
    onOpened,
    variant,
  }: {
    onOpened: () => void
    /** Overrides the chosen design (for /vorschau). */
    variant?: PresentVariant
  }) => {
    const chosen = useDesign("present")
    const which = variant ?? chosen
    const [phase, setPhase] = useState<Phase>("idle")
    const [taps, setTaps] = useState(0)
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
    useEffect(() => () => clearTimeout(timer.current), [])

    const tapsNeeded = which === "schuetteln" ? 3 : 1

    const handleTap = () => {
      if (phase !== "idle") return
      const next = taps + 1
      setTaps(next)
      if (next < tapsNeeded) {
        jingle(next - 1)
        return
      }
      sparkle()
      setPhase("opening")
      timer.current = setTimeout(onOpened, OPEN_MS)
    }

    const hint =
      phase === "opening"
        ? " "
        : which === "schuetteln"
          ? taps === 0
            ? "Tippe dreimal auf das Geschenk"
            : `Noch ${tapsNeeded - taps}× tippen …`
          : "Tippe auf das Geschenk, um es zu öffnen"

    return (
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={handleTap}
          aria-label="Geschenk öffnen"
          className={clsx(
            "present relative flex h-72 w-72 items-center justify-center rounded-3xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 sm:h-80 sm:w-80",
            phase === "opening"
              ? "present-opening cursor-default"
              : "cursor-pointer",
          )}
        >
          {phase === "opening" && <Rays />}
          {which === "schuetteln" ? (
            <ShakeBox taps={taps} opening={phase === "opening"} />
          ) : which === "auspacken" ? (
            <WrappedBox opening={phase === "opening"} />
          ) : (
            <RibbonBox opening={phase === "opening"} />
          )}
          {phase === "opening" && <Burst />}
        </button>
        <p className="min-h-[1.75rem] text-center text-lg" aria-live="polite">
          {hint}
        </p>
      </div>
    )
  },
)

/** Warm light beams that turn slowly behind an opening present. */
function Rays() {
  return <span aria-hidden className="present-rays" />
}

/** Little golden stars that fly out of the box. */
function Burst() {
  const stars = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2 + (i % 2) * 0.2
    const distance = 110 + (i % 3) * 30
    return {
      "--dx": `${Math.cos(angle) * distance}px`,
      "--dy": `${Math.sin(angle) * distance - 40}px`,
      "--delay": `${(i % 4) * 60}ms`,
      "--size": `${10 + (i % 3) * 5}px`,
    } as CSSProperties
  })
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {stars.map((style, i) => (
        <span key={i} className="burst-star" style={style} />
      ))}
    </span>
  )
}

/** A box and lid in one colour scheme, shared by two proposals. */
function Box({
  body,
  lid,
  ribbon,
  opening,
  seam,
}: {
  body: [string, string]
  lid: [string, string]
  ribbon: string
  opening: boolean
  /** 0 to 1: light leaking out between lid and box. */
  seam?: number
}) {
  const id = body[0].slice(1)
  return (
    <svg
      viewBox="0 0 200 220"
      className="relative h-full w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <linearGradient id={`body-${id}`} x1="0" x2="1">
          <stop offset="0%" stopColor={body[0]} />
          <stop offset="100%" stopColor={body[1]} />
        </linearGradient>
        <linearGradient id={`lid-${id}`} x1="0" x2="1">
          <stop offset="0%" stopColor={lid[0]} />
          <stop offset="100%" stopColor={lid[1]} />
        </linearGradient>
        <radialGradient id={`inner-${id}`} cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#fffbe6" />
          <stop offset="60%" stopColor="#fef08a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Shadow on the floor. */}
      <ellipse cx="100" cy="210" rx="78" ry="8" fill="black" opacity="0.3" />
      <rect
        x="30"
        y="98"
        width="140"
        height="108"
        rx="6"
        fill={`url(#body-${id})`}
      />
      <rect x="92" y="98" width="16" height="108" fill={ribbon} />
      {/* Light from inside once the lid lifts. */}
      <ellipse
        cx="100"
        cy="98"
        rx="64"
        ry="40"
        fill={`url(#inner-${id})`}
        className={clsx(
          "transition-opacity duration-500",
          opening ? "opacity-100" : "opacity-0",
        )}
      />
      {seam !== undefined && (
        <rect
          x="30"
          y="95"
          width="140"
          height="6"
          fill="#fef08a"
          style={{
            opacity: seam,
            filter: `drop-shadow(0 0 ${4 + seam * 10}px #fef08a)`,
            transition: "opacity .3s, filter .3s",
          }}
        />
      )}
      <g className="present-lid">
        <rect
          x="22"
          y="72"
          width="156"
          height="30"
          rx="5"
          fill={`url(#lid-${id})`}
        />
        <rect x="92" y="72" width="16" height="30" fill={ribbon} />
        <g className="present-bow">
          <path
            d="M100 72 C70 40 52 62 66 74 C74 80 90 76 100 72 Z"
            fill={ribbon}
          />
          <path
            d="M100 72 C130 40 148 62 134 74 C126 80 110 76 100 72 Z"
            fill={ribbon}
          />
          <path
            d="M100 72 L84 98 L92 98 L100 80 Z M100 72 L116 98 L108 98 L100 80 Z"
            fill={ribbon}
            opacity="0.85"
          />
          <circle
            cx="100"
            cy="72"
            r="8"
            fill={ribbon}
            stroke="rgba(0,0,0,.2)"
          />
        </g>
      </g>
    </svg>
  )
}

// --- Proposal 1: pull the bow ------------------------------------------------

function RibbonBox({ opening }: { opening: boolean }) {
  return (
    <span className={clsx("relative h-full w-full", !opening && "animate-bob")}>
      <Box
        body={["#b22424", "#7f1717"]}
        lid={["#cc3232", "#951c1c"]}
        ribbon="#e9c46a"
        opening={opening}
      />
      {!opening && <Glints />}
    </span>
  )
}

// --- Proposal 2: shake it three times ----------------------------------------

function ShakeBox({ taps, opening }: { taps: number; opening: boolean }) {
  return (
    <span
      className={clsx(
        "relative h-full w-full",
        !opening && taps === 0 && "animate-bob",
        !opening && taps > 0 && `present-shake-${taps}`,
      )}
      // Restart the shake on every tap.
      key={taps}
    >
      <Box
        body={["#1f6b3a", "#124a27"]}
        lid={["#2a8048", "#17592f"]}
        ribbon="#c62f2f"
        opening={opening}
        seam={opening ? 1 : taps / 3}
      />
    </span>
  )
}

// --- Proposal 3: tear off the paper ------------------------------------------

function WrappedBox({ opening }: { opening: boolean }) {
  const paper = (side: "left" | "right") => (
    <g
      clipPath={`url(#paper-${side})`}
      className={`present-paper present-paper-${side}`}
    >
      <rect
        x="26"
        y="70"
        width="148"
        height="136"
        rx="6"
        fill="url(#paper-pattern)"
      />
      <rect x="92" y="70" width="16" height="136" fill="#e9c46a" />
      <rect x="26" y="128" width="148" height="14" fill="#e9c46a" />
      <path
        d="M100 70 C74 40 56 60 70 72 C78 78 92 74 100 70 Z M100 70 C126 40 144 60 130 72 C122 78 108 74 100 70 Z"
        fill="#e9c46a"
      />
    </g>
  )
  return (
    <span className={clsx("relative h-full w-full", !opening && "animate-bob")}>
      <svg
        viewBox="0 0 200 220"
        className="relative h-full w-full overflow-visible"
        aria-hidden
      >
        <defs>
          <pattern
            id="paper-pattern"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <rect width="28" height="28" fill="#9f1f2a" />
            <path
              d="M7 3 l1.6 3.4 3.7.4 -2.8 2.5.8 3.7 -3.3 -1.9 -3.3 1.9.8 -3.7 -2.8 -2.5 3.7 -.4z"
              fill="#e9c46a"
            />
            <circle cx="21" cy="20" r="2" fill="#fbf3e2" />
          </pattern>
          <clipPath id="paper-left">
            <path d="M0 0 H104 L96 60 L108 110 L94 160 L104 220 H0 Z" />
          </clipPath>
          <clipPath id="paper-right">
            <path d="M104 0 H200 V220 H104 L94 160 L108 110 L96 60 Z" />
          </clipPath>
          <radialGradient id="crate-glow" cx="50%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#fffbe6" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="100" cy="210" rx="78" ry="8" fill="black" opacity="0.3" />
        {/* Under the paper: a simple wooden box with light inside. */}
        <rect x="30" y="96" width="140" height="110" rx="4" fill="#8a5a33" />
        <path
          d="M30 120 H170 M30 150 H170 M30 180 H170"
          stroke="#6e4426"
          strokeWidth="2"
        />
        <ellipse cx="100" cy="98" rx="62" ry="14" fill="#3b2412" />
        <ellipse
          cx="100"
          cy="96"
          rx="70"
          ry="50"
          fill="url(#crate-glow)"
          className={clsx(
            "transition-opacity duration-700",
            opening ? "opacity-100" : "opacity-0",
          )}
        />
        {paper("left")}
        {paper("right")}
      </svg>
      {opening && (
        <Image
          src={star}
          alt=""
          width={96}
          height={96}
          className="present-star pointer-events-none absolute left-1/2 top-[30%]"
        />
      )}
      {!opening && <Glints />}
    </span>
  )
}

/** Two small sparkles that twinkle on a waiting present. */
function Glints() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <span className="glint left-[20%] top-[30%]" />
      <span className="glint left-[74%] top-[48%] [animation-delay:1.1s]" />
      <span className="glint left-[60%] top-[22%] [animation-delay:2s]" />
    </span>
  )
}

export default Present
