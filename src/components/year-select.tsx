import { memo } from "react"

/**
 * The year picker of the calendar and the Rangliste: large, white and
 * glowing, with our own arrow (the browser's sits too close to the edge).
 */
const YearSelect = memo(
  ({
    years,
    value,
    onChange,
  }: {
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
          className="card-white cursor-pointer appearance-none rounded-full bg-pine-950/60 py-1 pl-5 pr-12 font-display text-2xl text-white [text-shadow:0_0_8px_rgb(200_225_255/0.55)] focus:outline-none focus:ring-4 focus:ring-white/50"
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
          className="pointer-events-none absolute right-5 top-1/2 h-2 w-3 -translate-y-1/2 text-white"
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
