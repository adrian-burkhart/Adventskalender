import clsx from "clsx"
import Image from "next/image"
import { memo } from "react"
import { DOOR_COUNT } from "@/lib/doors"
import starTree from "../../public/images/star-tree.webp"
import star from "../../public/images/star.webp"

// Every answered door hangs something on the player's tree, right or wrong:
// mostly baubles, every third one a star. The places are spread over the
// drawn tree (star-tree.webp) so the first few don't bunch up.
const SLOTS: [number, number][] = [
  [46.1, 66.5],
  [49.7, 25.1],
  [85.3, 81.8],
  [19.3, 77.2],
  [73.0, 64.2],
  [60.9, 81.4],
  [59.4, 50.8],
  [40.5, 49.6],
  [27.0, 63.7],
  [36.6, 75.5],
  [56.1, 35.3],
  [62.6, 70.5],
  [44.2, 34.6],
  [50.7, 82.1],
  [50.9, 58.6],
  [62.6, 61.9],
  [34.8, 58.5],
  [75.9, 80.9],
  [50.1, 50.2],
  [73.1, 72.4],
  [54.0, 73.8],
  [36.8, 66.5],
  [28.9, 79.9],
  [45.7, 42.5],
]

/** Painted bauble colours (light, middle, shadow), muted to suit the tree. */
const BAUBLES: [string, string, string][] = [
  ["#f08a78", "#c8423a", "#7e2320"],
  ["#f6d58a", "#d9a441", "#8f6420"],
  ["#a9c8ec", "#4f7fbe", "#25466f"],
  ["#f4f5f6", "#c9ced4", "#7f868e"],
  ["#e59ab0", "#a8384f", "#5e1c2b"],
]

export function isStar(index: number) {
  return index % 3 === 2
}

const ChristmasTree = memo(
  ({
    ornaments,
    className,
    highlightLast = false,
  }: {
    /** How many doors the player has answered. */
    ornaments: number
    className?: string
    /** Lets the newest ornament drop in. */
    highlightLast?: boolean
  }) => {
    const count = Math.min(ornaments, DOOR_COUNT)
    return (
      <div className={clsx("relative aspect-941/1070", className)}>
        <Image
          src={starTree}
          alt=""
          fill
          sizes="(min-width: 640px) 18rem, 60vw"
          className="object-contain"
        />
        {SLOTS.slice(0, count).map(([x, y], i) => {
          const isNew = highlightLast && i === count - 1
          return (
            <span
              key={i}
              className={clsx("absolute", isNew && "ornament-new")}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: isStar(i) ? "7.5%" : "6.4%",
                translate: "-50% -50%",
              }}
            >
              {isStar(i) ? (
                <Image
                  src={star}
                  alt=""
                  sizes="2rem"
                  className="h-auto w-full"
                />
              ) : (
                <Bauble kind={i % BAUBLES.length} />
              )}
            </span>
          )
        })}
      </div>
    )
  },
)

/**
 * A soft, painted-looking bauble: a little gold loop and cap, gentle
 * shading, a blurred highlight and a faint shadow on the branches.
 */
function Bauble({ kind }: { kind: number }) {
  const [light, middle, shadow] = BAUBLES[kind]
  const id = `bauble-${kind}`
  return (
    <svg viewBox="0 0 20 24" className="block w-full overflow-visible">
      <defs>
        <radialGradient id={id} cx="36%" cy="34%" r="70%">
          <stop offset="0%" stopColor={light} />
          <stop offset="55%" stopColor={middle} />
          <stop offset="100%" stopColor={shadow} />
        </radialGradient>
        <filter id="bauble-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.35" />
        </filter>
        <filter id="bauble-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.9" />
        </filter>
      </defs>
      {/* Shadow on the branches behind it. */}
      <ellipse
        cx="11.5"
        cy="16.5"
        rx="8.5"
        ry="7.5"
        fill="#1b3d17"
        opacity="0.35"
        filter="url(#bauble-blur)"
      />
      <g filter="url(#bauble-soft)">
        <circle
          cx="10"
          cy="2.2"
          r="1.5"
          fill="none"
          stroke="#c9a24a"
          strokeWidth="0.8"
        />
        <path d="M7.6 3.6 H12.4 L12 6.2 H8 Z" fill="#c9a24a" />
        <circle cx="10" cy="14.6" r="8.6" fill={`url(#${id})`} />
      </g>
      {/* A soft highlight, as if from a candle. */}
      <ellipse
        cx="7.4"
        cy="11.2"
        rx="2.4"
        ry="1.5"
        transform="rotate(-35 7.4 11.2)"
        fill="white"
        opacity="0.6"
        filter="url(#bauble-blur)"
      />
    </svg>
  )
}

export default ChristmasTree
