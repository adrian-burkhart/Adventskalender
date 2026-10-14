import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The calendar's palette: fir green, candle light and berry red.
        pine: {
          950: "#03170c",
          900: "#052e16",
          800: "#0b3d22",
          700: "#14532d",
        },
        candle: {
          DEFAULT: "#fef08a",
          soft: "#fdf6c8",
        },
        gold: {
          DEFAULT: "#e9c46a",
          light: "#f6dc94",
          dark: "#b8862b",
        },
        berry: {
          DEFAULT: "#c62f2f",
          light: "#e25555",
          dark: "#8e1d1d",
        },
        paper: "#fbf3e2",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
      },
      animation: {
        "spin-thrice": "spin 1s linear 3",
        glow: "glow 2.4s ease-in-out infinite",
        bob: "bob 2.6s ease-in-out infinite",
        "fade-in": "fade-in 0.6s ease-out both",
        "rise-in": "rise-in 0.7s cubic-bezier(.2,.8,.2,1) both",
      },
      keyframes: {
        glow: {
          "0%, 100%": {
            filter:
              "drop-shadow(0 0 6px rgb(254 240 138 / .45)) drop-shadow(0 0 16px rgb(233 196 106 / .25))",
          },
          "50%": {
            filter:
              "drop-shadow(0 0 12px rgb(254 240 138 / .8)) drop-shadow(0 0 30px rgb(233 196 106 / .45))",
          },
        },
        bob: {
          "0%, 100%": { transform: "translateY(0) rotate(-1deg)" },
          "50%": { transform: "translateY(-6px) rotate(1deg)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(16px) scale(.97)" },
          to: { opacity: "1", transform: "none" },
        },
      },
    },
  },
  plugins: [],
}
export default config
