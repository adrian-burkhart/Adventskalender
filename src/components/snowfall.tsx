"use client"

import { memo, useSyncExternalStore, type CSSProperties } from "react"

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

// Small snow crystals at different depths: the nearer, the larger and the
// faster.
const FAR = flakes(30, 5, [4, 6], [26, 38], [0.45, 0.65], 0)
const NEAR = flakes(22, 31, [7, 10], [18, 28], [0.7, 0.95], 0)

/**
 * Snow behind the page. Rendered in the browser only: it's decoration and
 * the server doesn't need to send it.
 */
const Snowfall = memo(() => {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  if (!mounted) return null

  return (
    <div aria-hidden className="snowfall">
      {FAR.map((flake, i) => (
        <Crystal key={`f${i}`} flake={flake} />
      ))}
      {NEAR.map((flake, i) => (
        <Crystal key={`n${i}`} flake={flake} />
      ))}
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
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <line x1="0" y1="0" x2="0" y2="-11" />
              <line x1="0" y1="-6" x2="-3" y2="-9" />
              <line x1="0" y1="-6" x2="3" y2="-9" />
            </g>
          ))}
          <circle r="1.6" fill="white" />
        </svg>
      </span>
    </span>
  )
}

export default Snowfall
