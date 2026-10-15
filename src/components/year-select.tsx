import clsx from "clsx"
import { memo } from "react"

/**
 * The year picker of the calendar (golden, like its text) and the
 * Rangliste (white), large and glowing, with our own arrow (the
 * browser's sits too close to the edge).
 */
const YearSelect = memo(
  ({
    years,
    value,
    onChange,
    tone = "white",
  }: {
    tone?: "white" | "gold"
    years: string[]
    value: string
    onChange: (year: string) => void
  }) => {
    return (
      <div className="relative">
        <select
          aria-label="Jahr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={clsx(
            "cursor-pointer appearance-none rounded-full bg-pine-950/60 py-1 pr-12 pl-5 font-display text-2xl focus:ring-4 focus:outline-hidden",
            tone === "white"
              ? "card-white text-white [text-shadow:0_0_8px_rgb(200_225_255/0.55)] focus:ring-white/50"
              : "text-candle shadow-[0_0_0_1.5px_rgb(233_196_106/0.8),0_0_14px_2px_rgb(233_196_106/0.3),inset_0_0_14px_rgb(233_196_106/0.1),0_8px_30px_rgb(0_0_0/0.35)] [text-shadow:0_0_8px_rgb(250_204_21/0.4)] focus:ring-gold/50",
          )}
        >
          {years.map((y) => (
            <option key={y} value={y} className="bg-pine-900 font-body">
              {y}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 12 8"
          aria-hidden
          className={clsx(
            "pointer-events-none absolute top-1/2 right-5 h-2 w-3 -translate-y-1/2",
            tone === "white" ? "text-white" : "text-candle",
          )}
        >
          <path
            d="M1 1.5 L6 6.5 L11 1.5"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  },
)

export default YearSelect
