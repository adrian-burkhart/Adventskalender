"use client"

// Soft bell sounds, made in the browser so they need no audio files. They
// only play after a tap, which browsers require for sound anyway.

let context: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === "undefined" || !("AudioContext" in window)) return null
  context ??= new AudioContext()
  if (context.state === "suspended") void context.resume()
  return context
}

/** One bell strike: a few partials that fade out like a small handbell. */
export function bell(frequency: number, delay = 0, volume = 0.18) {
  const ctx = audio()
  if (!ctx) return
  const start = ctx.currentTime + delay
  for (const [ratio, level, length] of [
    [1, 1, 1.6],
    [2.76, 0.35, 0.9],
    [5.4, 0.12, 0.5],
  ]) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "sine"
    osc.frequency.value = frequency * ratio
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume * level, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + length + 0.05)
  }
}

/** A short rising sparkle for a present that opens. */
export function sparkle() {
  ;[1046.5, 1318.5, 1568, 2093].forEach((frequency, i) =>
    bell(frequency, i * 0.08, 0.14),
  )
}

/** A small jingle that climbs with each shake (step 0, 1, 2 …). */
export function jingle(step: number) {
  bell(659.25 * Math.pow(1.122, step), 0, 0.12)
  bell(987.77 * Math.pow(1.122, step), 0.06, 0.08)
}

/** A warm three-note chord for a right answer. */
export function warmChord() {
  ;[523.25, 659.25, 783.99].forEach((frequency, i) =>
    bell(frequency, i * 0.12, 0.12),
  )
}
