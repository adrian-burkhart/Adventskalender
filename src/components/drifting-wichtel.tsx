"use client"

import Image from "next/image"
import { useEffect, useRef, type RefObject } from "react"
import parachuteWichtel from "../../public/images/parachute-wichtel.webp"

/** Where he hung in the Rangliste picture, as a share of its size. */
const START = { left: 0.71, top: 0.115, width: 0.13 }

/**
 * The Wichtel with the parachute takes off from the Rangliste picture and
 * drifts slowly over the page on a changing wind, swaying a little. He
 * never blocks a tap: clicks go through him.
 */
export default function DriftingWichtel({
  picture,
}: {
  /** The Rangliste picture he starts from. */
  picture: RefObject<HTMLElement | null>
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    const start = picture.current
    if (!node || !start) return

    const box = start.getBoundingClientRect()
    const width = box.width * START.width
    const height = width * (88 / 52)
    let x = box.left + box.width * START.left
    let y = box.top + box.height * START.top
    node.style.width = `${width}px`

    const place = (rotation: number) => {
      node.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`
    }
    place(0)
    node.style.opacity = "1"

    // People who don't want motion see him hanging where he was drawn.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let vx = -6
    let vy = 4
    let time = 0
    let last = performance.now()
    let frame = 0

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      time += dt

      // A slowly turning wind, mostly sideways, sometimes lifting him.
      const windX = Math.sin(time * 0.11) * 16 + Math.sin(time * 0.31 + 1) * 8
      const windY = 3 + Math.sin(time * 0.19 + 2) * 10
      vx += (windX - vx) * 0.5 * dt
      vy += (windY - vy) * 0.5 * dt

      // Gently turn back before he leaves the window.
      const margin = 8
      const right = window.innerWidth - width - margin
      const bottom = window.innerHeight - height - margin
      if (x < margin) vx += 25 * dt
      if (x > right) vx -= 25 * dt
      if (y < margin) vy += 25 * dt
      if (y > bottom) vy -= 25 * dt

      x += vx * dt
      y += vy * dt
      place(vx * 0.9 + Math.sin(time * 1.3) * 4)
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [picture])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-10 opacity-0 transition-opacity duration-500"
      style={{ transformOrigin: "50% 15%" }}
    >
      <Image src={parachuteWichtel} alt="" className="h-auto w-full" />
    </div>
  )
}
