"use client"

import clsx from "clsx"
import Image from "next/image"
import { memo, useEffect, useRef, useState, type CSSProperties } from "react"
import { useDesign, type DesignChoice } from "@/lib/design-variants"
import { jingle, sparkle } from "@/lib/chime"
import star from "../../../public/images/star.webp"

export type PresentVariant = DesignChoice<"present">

/** How long the opening plays before the result shows. */
const OPEN_MS = 2200

type Phase = "idle" | "opening"

/**
 * The present after answering, drawn in the soft painted style of the other
 * pictures. It waits for a tap and then opens calmly: the lid lifts, warm
 * light comes out and a few flakes float up.
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
    const opening = phase === "opening"

    const handleTap = () => {
      if (opening) return
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

    const hint = opening
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
            "relative flex h-72 w-72 items-center justify-center rounded-3xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/60 sm:h-80 sm:w-80",
            opening ? "present-opening cursor-default" : "cursor-pointer",
          )}
        >
          {which === "saeckchen" ? (
            <Sack opening={opening} />
          ) : (
            <span
              // A new key restarts the wobble on every tap.
              key={taps}
              className={clsx(
                "relative block h-full w-full",
                !opening && taps === 0 && "present-breathe",
                !opening && taps > 0 && `present-wobble-${taps}`,
              )}
            >
              <PaintedBox
                opening={opening}
                colors={
                  which === "schuetteln"
                    ? {
                        light: "#5e9a55",
                        body: "#3d7339",
                        dark: "#24502a",
                        ribbon: "#c4473a",
                        ribbonDark: "#8f2c24",
                      }
                    : {
                        light: "#d9655a",
                        body: "#b23a30",
                        dark: "#7d2420",
                        ribbon: "#ecd08a",
                        ribbonDark: "#b9944a",
                      }
                }
                peek={which === "schuetteln" ? taps / 3 : 0}
              />
            </span>
          )}
          {opening && <Flakes />}
        </button>
        <p className="min-h-[1.75rem] text-center text-lg" aria-live="polite">
          {hint}
        </p>
      </div>
    )
  },
)

/** A soft blur and a slightly uneven edge, like a brush. */
function PaintFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.05"
        numOctaves="2"
        seed="7"
      />
      <feDisplacementMap in="SourceGraphic" scale="2" />
      <feGaussianBlur stdDeviation="1.1" />
    </filter>
  )
}

interface BoxColors {
  light: string
  body: string
  dark: string
  ribbon: string
  ribbonDark: string
}

function PaintedBox({
  opening,
  colors,
  peek,
}: {
  opening: boolean
  colors: BoxColors
  /** 0 to 1: warm light showing under the lid before it opens. */
  peek: number
}) {
  const id = colors.body.slice(1)
  return (
    <svg
      viewBox="0 0 200 220"
      className="h-full w-full overflow-visible"
      aria-hidden
    >
      <defs>
        <PaintFilter id={`paint-${id}`} />
        <radialGradient id={`body-${id}`} cx="30%" cy="25%" r="90%">
          <stop offset="0%" stopColor={colors.light} />
          <stop offset="55%" stopColor={colors.body} />
          <stop offset="100%" stopColor={colors.dark} />
        </radialGradient>
        <linearGradient id={`ribbon-${id}`} x1="0" x2="1">
          <stop offset="0%" stopColor={colors.ribbonDark} />
          <stop offset="40%" stopColor={colors.ribbon} />
          <stop offset="100%" stopColor={colors.ribbonDark} />
        </linearGradient>
        <radialGradient id={`light-${id}`} cx="50%" cy="70%" r="50%">
          <stop offset="0%" stopColor="#fff6c8" stopOpacity="0.95" />
          <stop offset="60%" stopColor="#fde68a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx="100"
        cy="208"
        rx="76"
        ry="9"
        fill="black"
        opacity="0.28"
        filter={`url(#paint-${id})`}
      />
      {/* Warm light from inside. */}
      <ellipse
        cx="100"
        cy="96"
        rx="80"
        ry="64"
        fill={`url(#light-${id})`}
        style={{
          opacity: opening ? 1 : peek * 0.5,
          transition: "opacity .8s ease-out",
        }}
      />
      <g filter={`url(#paint-${id})`}>
        <path
          d="M34 98 L166 98 L162 204 Q100 210 38 204 Z"
          fill={`url(#body-${id})`}
        />
        <path
          d="M91 98 L109 98 L108 206 L92 206 Z"
          fill={`url(#ribbon-${id})`}
        />
        <g className="present-lid">
          <path
            d="M24 74 Q100 66 176 74 L174 102 Q100 108 26 102 Z"
            fill={`url(#body-${id})`}
          />
          <path
            d="M90 68 L110 68 L110 105 L90 105 Z"
            fill={`url(#ribbon-${id})`}
          />
          <g>
            <path
              d="M100 70 C76 34 50 52 64 70 C72 78 90 74 100 70 Z"
              fill={`url(#ribbon-${id})`}
            />
            <path
              d="M100 70 C124 34 150 52 136 70 C128 78 110 74 100 70 Z"
              fill={`url(#ribbon-${id})`}
            />
            <ellipse cx="100" cy="70" rx="8" ry="7" fill={colors.ribbonDark} />
          </g>
        </g>
      </g>
    </svg>
  )
}

/** A jute sack tied with a red ribbon; the star comes out of it. */
function Sack({ opening }: { opening: boolean }) {
  return (
    <span
      className={clsx(
        "relative block h-full w-full",
        !opening && "present-breathe",
      )}
    >
      <svg
        viewBox="0 0 200 220"
        className="h-full w-full overflow-visible"
        aria-hidden
      >
        <defs>
          <PaintFilter id="paint-sack" />
          <radialGradient id="jute" cx="35%" cy="35%" r="85%">
            <stop offset="0%" stopColor="#d9b98a" />
            <stop offset="60%" stopColor="#b48a57" />
            <stop offset="100%" stopColor="#7d5a33" />
          </radialGradient>
          <pattern
            id="weave"
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 2.5 H5 M2.5 0 V5"
              stroke="#6e4c2a"
              strokeWidth="0.6"
              opacity="0.35"
            />
          </pattern>
          <radialGradient id="sack-light" cx="50%" cy="55%" r="50%">
            <stop offset="0%" stopColor="#fff6c8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          cx="100"
          cy="208"
          rx="70"
          ry="9"
          fill="black"
          opacity="0.28"
          filter="url(#paint-sack)"
        />
        <ellipse
          cx="100"
          cy="70"
          rx="60"
          ry="46"
          fill="url(#sack-light)"
          style={{
            opacity: opening ? 1 : 0,
            transition: "opacity .8s ease-out",
          }}
        />
        <g filter="url(#paint-sack)">
          {/* The sack, gathered at the neck; it opens a little when untied. */}
          <path
            d={
              opening
                ? "M64 60 Q100 52 136 60 Q140 84 132 92 Q176 124 168 176 Q160 208 100 208 Q40 208 32 176 Q24 124 68 92 Q60 84 64 60 Z"
                : "M78 58 Q100 50 122 58 Q118 80 116 88 Q176 120 168 176 Q160 208 100 208 Q40 208 32 176 Q24 120 84 88 Q82 80 78 58 Z"
            }
            fill="url(#jute)"
            style={{ transition: "d .6s ease-out" }}
          />
          <path
            d="M84 88 Q24 120 32 176 Q40 208 100 208 Q160 208 168 176 Q176 120 116 88 Z"
            fill="url(#weave)"
          />
          <g className="sack-bow">
            <path
              d="M84 88 Q100 94 116 88 L116 95 Q100 101 84 95 Z"
              fill="#b8352b"
            />
            <path
              d="M100 92 C80 70 64 84 74 96 C80 102 92 96 100 92 Z"
              fill="#c4473a"
            />
            <path
              d="M100 92 C120 70 136 84 126 96 C120 102 108 96 100 92 Z"
              fill="#c4473a"
            />
            <path
              d="M98 94 L88 122 L95 121 L100 100 Z M102 94 L112 122 L105 121 L100 100 Z"
              fill="#a93026"
            />
            <ellipse cx="100" cy="93" rx="6" ry="5" fill="#8f2c24" />
          </g>
        </g>
      </svg>
      {opening && (
        <Image
          src={star}
          alt=""
          width={84}
          height={84}
          className="present-star pointer-events-none absolute left-1/2 top-[14%]"
        />
      )}
    </span>
  )
}

/** A few soft snowflakes that float up out of the opened present. */
function Flakes() {
  const flakes = Array.from({ length: 9 }, (_, i) => {
    const x = -50 + ((i * 37) % 100)
    return {
      "--x": `${x}px`,
      "--drift": `${(i % 2 ? 1 : -1) * (10 + ((i * 7) % 20))}px`,
      "--delay": `${150 + i * 110}ms`,
      "--size": `${6 + (i % 3) * 3}px`,
    } as CSSProperties
  })
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {flakes.map((style, i) => (
        <span key={i} className="rising-flake" style={style} />
      ))}
    </span>
  )
}

export default Present
