"use client"

import { memo, useSyncExternalStore, type CSSProperties } from "react"
import { useDesign, type DesignChoice } from "@/lib/design-variants"

export type SnowVariant = DesignChoice<"snow">

const subscribe = () => () => {}

/** Same numbers on every render, so the flakes don't jump around. */
function seeded(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

interface Flake {
  left: number
  top: number
  size: number
  duration: number
  delay: number
  sway: number
  opacity: number
  blur: number
}

function flakes(
  count: number,
  seed: number,
  size: [number, number],
  speed: [number, number],
  opacity: [number, number],
  blur: number,
): Flake[] {
  const random = seeded(seed)
  const between = ([a, b]: [number, number]) => a + random() * (b - a)
  return Array.from({ length: count }, () => {
    const duration = between(speed)
    return {
      left: random() * 100,
      top: random() * 100,
      size: between(size),
      duration,
      delay: -random() * duration,
      sway: 10 + random() * 30,
      opacity: between(opacity),
      blur,
    }
  })
}

// Soft, painted-looking flakes in three depths.
const SOFT_BACK = flakes(50, 7, [3, 5], [28, 40], [0.45, 0.7], 0.5)
const SOFT_MIDDLE = flakes(30, 11, [7, 11], [18, 26], [0.7, 0.9], 0.8)
const SOFT_FRONT = flakes(8, 23, [18, 28], [12, 18], [0.45, 0.65], 2.5)
// Crystal flakes.
const CRYSTALS = flakes(26, 5, [12, 26], [16, 30], [0.65, 0.95], 0)
const FEW_CRYSTALS = flakes(7, 31, [18, 28], [14, 22], [0.75, 0.95], 0)

/**
 * Snow behind the page. Rendered in the browser only: it's decoration and
 * the server doesn't need to send it.
 */
const Snowfall = memo(({ variant }: { variant?: SnowVariant }) => {
  const chosen = useDesign("snow")
  const which = variant ?? chosen
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  if (!mounted) return null

  return (
    <div aria-hidden className="snowfall">
      {which === "punkte" && <div className="snow-dots" />}
      {(which === "gemalt" || which === "gemischt") && (
        <>
          {SOFT_BACK.map((flake, i) => (
            <SoftFlake key={`b${i}`} flake={flake} />
          ))}
          {SOFT_MIDDLE.map((flake, i) => (
            <SoftFlake key={`m${i}`} flake={flake} />
          ))}
        </>
      )}
      {which === "gemalt" &&
        SOFT_FRONT.map((flake, i) => <SoftFlake key={`f${i}`} flake={flake} />)}
      {which === "kristalle" &&
        CRYSTALS.map((flake, i) => <Crystal key={i} flake={flake} />)}
      {which === "gemischt" &&
        FEW_CRYSTALS.map((flake, i) => <Crystal key={i} flake={flake} />)}
    </div>
  )
})

function style(flake: Flake): CSSProperties {
  return {
    left: `${flake.left}%`,
    width: flake.size,
    height: flake.size,
    opacity: flake.opacity,
    animationDuration: `${flake.duration}s`,
    animationDelay: `${flake.delay}s`,
    filter: flake.blur ? `blur(${flake.blur}px)` : undefined,
    "--top": `${flake.top}%`,
    "--sway": `${flake.sway}px`,
  } as CSSProperties
}

function SoftFlake({ flake }: { flake: Flake }) {
  return (
    <span className="flake" style={style(flake)}>
      <span
        className="flake-sway flake-soft"
        style={{ animationDuration: `${flake.duration / 3}s` }}
      />
    </span>
  )
}

function Crystal({ flake }: { flake: Flake }) {
  return (
    <span className="flake" style={style(flake)}>
      <span
        className="flake-sway"
        style={{ animationDuration: `${flake.duration / 3}s` }}
      >
        <svg
          viewBox="-12 -12 24 24"
          className="flake-spin h-full w-full"
          style={{ animationDuration: `${flake.duration}s` }}
        >
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <g
              key={angle}
              transform={`rotate(${angle})`}
              stroke="white"
              strokeWidth="1.3"
              strokeLinecap="round"
            >
              <line x1="0" y1="0" x2="0" y2="-11" />
              <line x1="0" y1="-6" x2="-3" y2="-9" />
              <line x1="0" y1="-6" x2="3" y2="-9" />
              <line x1="0" y1="-3" x2="-2" y2="-4.5" />
              <line x1="0" y1="-3" x2="2" y2="-4.5" />
            </g>
          ))}
          <circle r="1.6" fill="white" />
        </svg>
      </span>
    </span>
  )
}

export default Snowfall
