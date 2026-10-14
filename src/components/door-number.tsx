"use client"

import { memo } from "react"
import { useDesign, type DesignChoice } from "@/lib/design-variants"

export type DoorNumberVariant = DesignChoice<"hausnummer">

/**
 * The number on a calendar door. The proposals hang it above the door like
 * a house number, so it doesn't sit in front of the door while it opens.
 */
const DoorNumber = memo(
  ({
    number,
    variant,
  }: {
    number: number
    /** Overrides the chosen design (for /vorschau). */
    variant?: DoorNumberVariant
  }) => {
    const chosen = useDesign("hausnummer")
    const which = variant ?? chosen
    const above =
      "pointer-events-none absolute left-1/2 top-[3%] -translate-x-1/2"

    if (which === "emaille") {
      // A blue enamel sign with a white rim, as on German houses.
      return (
        <span aria-hidden className={above}>
          <span className="block rounded-[0.6rem] bg-[#1f4f9a] p-[3px] shadow-[0_3px_6px_rgb(0_0_0/0.55),inset_0_1px_2px_rgb(255_255_255/0.4)]">
            <span className="block min-w-[2.6rem] rounded-[0.45rem] border-2 border-white/95 px-2 py-0.5 text-center font-body text-2xl font-bold leading-tight text-white sm:min-w-[3.2rem] sm:text-3xl">
              {number}
            </span>
          </span>
        </span>
      )
    }

    if (which === "holz") {
      // A little wooden board hanging on a string.
      return (
        <span aria-hidden className={above}>
          <svg
            viewBox="0 0 60 18"
            className="absolute -top-3 left-1/2 w-[70%] -translate-x-1/2 overflow-visible"
          >
            <path
              d="M6 18 L30 2 L54 18"
              stroke="#5a3a1e"
              strokeWidth="1.6"
              fill="none"
            />
            <circle cx="30" cy="2" r="2" fill="#c9a24a" />
          </svg>
          <span
            className="relative block min-w-[2.8rem] rounded-md px-2.5 py-0.5 text-center font-display text-2xl leading-tight text-[#fdf3dc] shadow-[0_3px_6px_rgb(0_0_0/0.5)] sm:min-w-[3.4rem] sm:text-3xl"
            style={{
              background:
                "repeating-linear-gradient(90deg, rgb(0 0 0 / 0.06) 0 2px, transparent 2px 7px), linear-gradient(180deg, #a0703f, #6e4626)",
              textShadow: "0 1px 1px rgb(0 0 0 / 0.5)",
            }}
          >
            {number}
          </span>
        </span>
      )
    }

    if (which === "messing") {
      // Brass digits on a dark slate.
      return (
        <span aria-hidden className={above}>
          <span className="block min-w-[2.8rem] rounded-full bg-[#1d1a17]/90 px-3 py-0.5 text-center shadow-[0_3px_6px_rgb(0_0_0/0.55),inset_0_0_0_1.5px_rgb(201_162_74/0.7)] sm:min-w-[3.4rem]">
            <span
              className="font-door text-2xl leading-tight sm:text-3xl"
              style={{
                background:
                  "linear-gradient(180deg, #fff1b8 0%, #e2b64a 45%, #9c6f1c 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {number}
            </span>
          </span>
        </span>
      )
    }

    return (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[38%] text-center font-door text-5xl text-berry-light [text-shadow:0_0_6px_rgb(255_255_255/0.85),0_2px_4px_rgb(0_0_0/0.6)] sm:text-6xl"
      >
        {number}
      </span>
    )
  },
)

export default DoorNumber
