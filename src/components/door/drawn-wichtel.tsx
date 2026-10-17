// A Wichtel drawn in SVG after the painted ones in the app: long floppy hat,
// headphones, a big beard, red coat with white fur, green mittens and brown
// boots. Drawn facing right, pushing something with both hands.

export interface WichtelLook {
  /** Used for unique gradient ids. */
  id: string
  hat: [string, string]
  coat: [string, string]
  beard: [string, string]
  mittens: string
}

export const RED_WICHTEL: WichtelLook = {
  id: "rot",
  hat: ["#d9473a", "#8e1d1d"],
  coat: ["#cf3b30", "#8e1d1d"],
  beard: ["#ffffff", "#c9ccd2"],
  mittens: "#3f8a3a",
}

export function DrawnWichtel({
  look,
  lookDown = false,
}: {
  look: WichtelLook
  /** Turns his head down to what he holds in his hands. */
  lookDown?: boolean
}) {
  const g = (name: string) => `${name}-${look.id}`
  return (
    <g>
      <defs>
        <linearGradient id={g("hat")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={look.hat[0]} />
          <stop offset="100%" stopColor={look.hat[1]} />
        </linearGradient>
        <linearGradient id={g("coat")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={look.coat[0]} />
          <stop offset="100%" stopColor={look.coat[1]} />
        </linearGradient>
        <radialGradient id={g("beard")} cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor={look.beard[0]} />
          <stop offset="100%" stopColor={look.beard[1]} />
        </radialGradient>
        <radialGradient id={g("boot")} cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#9a6a40" />
          <stop offset="100%" stopColor="#5a3820" />
        </radialGradient>
      </defs>

      {/* Shadow and boots. */}
      <ellipse cx="58" cy="155" rx="34" ry="4.5" fill="black" opacity="0.25" />
      <ellipse cx="44" cy="148" rx="13" ry="7" fill={`url(#${g("boot")})`} />
      <ellipse cx="74" cy="149" rx="13" ry="7" fill={`url(#${g("boot")})`} />

      {/* Coat with a fluffy hem. */}
      <path
        d="M36 96 Q30 124 30 144 Q58 152 88 144 Q88 122 82 96 Q60 86 36 96 Z"
        fill={`url(#${g("coat")})`}
      />
      <path
        d="M31 143 Q58 151 88 143"
        stroke="#f6f6f2"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Arms reaching forward to push. */}
      <path
        d="M70 100 Q88 104 100 112"
        stroke={look.coat[1]}
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M64 108 Q84 116 98 126"
        stroke={look.coat[0]}
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="98" cy="110" r="4.5" fill="#f6f6f2" />
      <circle cx="96" cy="124" r="4.5" fill="#f6f6f2" />
      <ellipse cx="104" cy="112" rx="7" ry="6" fill={look.mittens} />
      <ellipse cx="102" cy="126" rx="7" ry="6" fill={look.mittens} />
      <ellipse cx="103" cy="106.5" rx="2.5" ry="3.2" fill={look.mittens} />

      {/* The big beard, with a few strands. */}
      <path
        d="M36 76 Q34 104 50 124 Q58 136 64 138 Q68 128 76 118 Q88 100 84 76 Q60 68 36 76 Z"
        fill={`url(#${g("beard")})`}
      />
      <g stroke={look.beard[1]} strokeWidth="1" fill="none" opacity="0.6">
        <path d="M46 86 Q48 104 58 122" />
        <path d="M60 84 Q60 106 63 128" />
        <path d="M72 86 Q72 102 68 120" />
      </g>

      <g transform={lookDown ? "rotate(14 60 80) translate(4 2)" : undefined}>
        {/* Face: cheeks and the round nose. */}
        <ellipse cx="60" cy="72" rx="15" ry="7" fill="#f2c4a8" />
        <path
          d="M44 80 Q52 74 60 79 Q68 74 76 80"
          stroke={look.beard[0]}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="60" cy="78" r="6.5" fill="#e98b7a" />
        <circle cx="58" cy="76" r="2" fill="white" opacity="0.6" />

        {/* The long hat, flopping to the side. */}
        <path
          d="M38 72 Q40 40 58 24 Q72 10 98 18 Q80 24 74 42 Q80 58 84 72 Q60 64 38 72 Z"
          fill={`url(#${g("hat")})`}
        />

        {/* Headphones over the hat, with the cable. */}
        <g>
          <path
            d="M39 68 Q42 34 60 30 Q78 34 81 68"
            stroke="#262626"
            strokeWidth="3"
            fill="none"
          />
          <ellipse cx="38" cy="70" rx="5.5" ry="7" fill="#262626" />
          <ellipse cx="82" cy="70" rx="5.5" ry="7" fill="#262626" />
          <path
            d="M36 77 Q30 100 38 116 Q42 126 36 134"
            stroke="#262626"
            strokeWidth="1"
            fill="none"
          />
        </g>
      </g>
    </g>
  )
}
