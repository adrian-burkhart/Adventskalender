import { memo } from "react"

/**
 * A snowman that grows by one piece per right answer, 24 in all: first the
 * three snowballs are rolled bigger, then face, buttons, arms and
 * finally the trimmings. Nothing is ever taken away again.
 */
const Snowman = memo(
  ({ pieces, className }: { pieces: number; className?: string }) => {
    const n = Math.max(0, Math.min(24, pieces))
    const has = (piece: number) => n >= piece

    // Each snowball gets rolled a little bigger per piece.
    const bottom = [0, 20, 30, 39, 46][Math.min(n, 4)]
    const middle = n < 5 ? 0 : [22, 29, 34][Math.min(n, 7) - 5]
    const head = n < 8 ? 0 : [19, 24][Math.min(n, 9) - 8]

    const ground = 244
    const bottomY = ground - bottom
    const middleY = bottomY - bottom - middle + 9
    const headY = middleY - middle - head + 7

    return (
      <svg
        viewBox="0 0 220 260"
        className={className}
        role="img"
        aria-label={`Schneemann mit ${n} von 24 Teilen`}
      >
        <defs>
          <radialGradient id="snow" cx="0.38" cy="0.32" r="0.75">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.7" stopColor="#eef4fa" />
            <stop offset="1" stopColor="#c9d8e8" />
          </radialGradient>
          <radialGradient id="lantern-glow">
            <stop offset="0" stopColor="#fde68a" stopOpacity="0.8" />
            <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Snowy ground */}
        <ellipse cx="110" cy={ground + 4} rx="100" ry="10" fill="#e8f0f7" />

        {/* 23: lantern, glowing on the ground */}
        {has(23) && (
          <g transform="translate(34 210)">
            <circle cx="0" cy="18" r="28" fill="url(#lantern-glow)" />
            <path d="M-6 4 h12 l3 -4 h-18 z" fill="#3f2a1d" />
            <rect
              x="-8"
              y="4"
              width="16"
              height="26"
              rx="2"
              fill="#fcd34d"
              stroke="#3f2a1d"
              strokeWidth="2.5"
            />
            <path d="M0 8 c-3 4 -3 8 0 10 c3 -2 3 -6 0 -10" fill="#f97316" />
            <rect
              x="-10"
              y="30"
              width="20"
              height="5"
              rx="1.5"
              fill="#3f2a1d"
            />
            <path
              d="M-5 0 a5 5 0 0 1 10 0"
              fill="none"
              stroke="#3f2a1d"
              strokeWidth="2"
            />
          </g>
        )}

        {/* 21: broom, leaning at the right */}
        {has(21) && (
          <g>
            <line
              x1="176"
              y1="70"
              x2="168"
              y2="226"
              stroke="#8b5a2b"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M158 220 l20 0 l8 26 l-36 0 z"
              fill="#d6a756"
              stroke="#9a6a2c"
              strokeWidth="1.5"
            />
            <path
              d="M160 226 l-4 20 M166 226 l-2 20 M172 226 l2 20 M178 226 l4 20"
              stroke="#9a6a2c"
              strokeWidth="1.2"
            />
          </g>
        )}

        {/* 1–4: bottom snowball */}
        {bottom > 0 && (
          <circle cx="110" cy={bottomY} r={bottom} fill="url(#snow)" />
        )}

        {/* 24: fairy lights, draped round the bottom */}
        {has(24) && (
          <g>
            <path
              d={`M${110 - bottom + 4} ${bottomY - 6} Q110 ${bottomY + 22} ${110 + bottom - 4} ${bottomY - 6}`}
              fill="none"
              stroke="#14532d"
              strokeWidth="1.5"
            />
            {[0.12, 0.3, 0.5, 0.7, 0.88].map((t, i) => {
              const x0 = 110 - bottom + 4
              const x1 = 110 + bottom - 4
              const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * 110 + t ** 2 * x1
              const y =
                (1 - t) ** 2 * (bottomY - 6) +
                2 * (1 - t) * t * (bottomY + 22) +
                t ** 2 * (bottomY - 6)
              return (
                <circle
                  key={t}
                  cx={x}
                  cy={y + 3}
                  r="3.6"
                  fill={
                    ["#fcd34d", "#ef4444", "#60a5fa", "#fcd34d", "#ef4444"][i]
                  }
                />
              )
            })}
          </g>
        )}

        {/* 5–7: middle snowball */}
        {middle > 0 && (
          <circle cx="110" cy={middleY} r={middle} fill="url(#snow)" />
        )}

        {/* 14–16: coal buttons */}
        {[14, 15, 16].map(
          (piece, i) =>
            has(piece) && (
              <circle
                key={piece}
                cx="110"
                cy={middleY - 10 + i * 12}
                r="3.4"
                fill="#292524"
              />
            ),
        )}

        {/* 17–18: twig arms */}
        {has(17) && (
          <path
            d={`M${110 - middle + 4} ${middleY - 4} L${44} ${middleY - 30} M58 ${middleY - 24} l-6 -12 M50 ${middleY - 27} l-10 2`}
            stroke="#6b4423"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        )}
        {has(18) && (
          <path
            d={`M${110 + middle - 4} ${middleY - 4} L176 ${middleY - 22} M164 ${middleY - 19} l6 -12`}
            stroke="#6b4423"
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* 22: robin on the left twig */}
        {has(22) && (
          <g transform={`translate(48 ${middleY - 38})`}>
            <ellipse cx="0" cy="0" rx="9" ry="7" fill="#7c5a3a" />
            <ellipse cx="3" cy="2" rx="5" ry="4.5" fill="#e4572e" />
            <circle cx="6" cy="-6" r="5" fill="#7c5a3a" />
            <circle cx="7.5" cy="-7" r="1.1" fill="#111" />
            <path d="M10.5 -6 l4 1 l-4 1 z" fill="#f59e0b" />
            <path d="M-8 -1 l-8 -4 l2 6 z" fill="#5c4030" />
          </g>
        )}

        {/* 8–9: head */}
        {head > 0 && <circle cx="110" cy={headY} r={head} fill="url(#snow)" />}

        {/* 19: scarf */}
        {has(19) && (
          <g>
            <path
              d={`M${110 - head - 1} ${headY + head - 6} q${head + 1} 12 ${2 * head + 2} 0 l0 9 q-${head + 1} 12 -${2 * head + 2} 0 z`}
              fill="#b91c1c"
            />
            <path
              d={`M122 ${headY + head + 2} l4 26 l9 -2 l-5 -24 z`}
              fill="#b91c1c"
            />
            <path
              d={`M124 ${headY + head + 12} l8 -1 M126 ${headY + head + 20} l8 -1`}
              stroke="#fef3c7"
              strokeWidth="2.5"
            />
          </g>
        )}

        {/* 10–11: coal eyes */}
        {has(10) && <circle cx="101" cy={headY - 5} r="2.8" fill="#292524" />}
        {has(11) && <circle cx="119" cy={headY - 5} r="2.8" fill="#292524" />}

        {/* 12: carrot nose */}
        {has(12) && (
          <path d={`M110 ${headY - 1} l18 4 l-18 4 z`} fill="#f97316" />
        )}

        {/* 13: smile */}
        {has(13) &&
          [-8, -4, 0, 4, 8].map((dx) => (
            <circle
              key={dx}
              cx={110 + dx}
              cy={headY + 11 - Math.abs(dx) * 0.35}
              r="1.6"
              fill="#292524"
            />
          ))}

        {/* 20: Wichtel hat with a bobble */}
        {has(20) && (
          <g>
            <path
              d={`M${110 - head + 1} ${headY - head + 9} Q100 ${headY - head - 40} 146 ${headY - head - 26} Q124 ${headY - head - 6} ${110 + head - 1} ${headY - head + 9} z`}
              fill="#c0262d"
            />
            <rect
              x={110 - head - 2}
              y={headY - head + 4}
              width={2 * head + 4}
              height="9"
              rx="4.5"
              fill="#f8fafc"
            />
            <circle cx="147" cy={headY - head - 26} r="6" fill="#f8fafc" />
          </g>
        )}
      </svg>
    )
  },
)

export default Snowman
