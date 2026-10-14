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

/** Painted bauble colours: light, middle and shadow. */
const BAUBLES: [string, string, string][] = [
  ["#ff8a7a", "#d23a2c", "#8e1d1d"],
  ["#ffe08a", "#e5a823", "#a8700f"],
  ["#9ccaf2", "#3d7fc4", "#234f86"],
  ["#f4f4f4", "#c3c8cf", "#80868f"],
  ["#f2a7d8", "#c0509a", "#7d2a63"],
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
      <div className={clsx("relative aspect-[941/1070]", className)}>
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
                width: isStar(i) ? "7.5%" : "5.6%",
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
                <Bauble colors={BAUBLES[i % BAUBLES.length]} />
              )}
            </span>
          )
        })}
      </div>
    )
  },
)

/** A soft, painted-looking bauble with a little cap. */
function Bauble({
  colors: [light, middle, shadow],
}: {
  colors: [string, string, string]
}) {
  return (
    <span className="relative block aspect-[1/1.15] w-full">
      <span className="absolute left-1/2 top-0 h-[22%] w-[38%] -translate-x-1/2 rounded-[1px] bg-[#c9a24a]" />
      <span
        className="absolute bottom-0 left-0 aspect-square w-full rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 32%, ${light} 0%, ${middle} 45%, ${shadow} 100%)`,
          boxShadow: `0 0 3px ${middle}`,
          filter: "blur(0.25px)",
        }}
      />
      <span className="absolute left-[22%] top-[38%] h-[22%] w-[22%] rounded-full bg-white/70 blur-[0.6px]" />
    </span>
  )
}

export default ChristmasTree
