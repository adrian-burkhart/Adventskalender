"use client"

import { memo, useEffect, useRef, useState } from "react"

function secondsLeft(deadline: number) {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
}

/** Counts down to the server's deadline, so a reload doesn't reset it. */
const Countdown = memo(
  ({
    deadline,
    onComplete,
    isSubmitted,
  }: {
    deadline: number
    isSubmitted: boolean
    onComplete: () => void
  }) => {
    const [count, setCount] = useState(() => secondsLeft(deadline))
    const onCompleteRef = useRef(onComplete)

    useEffect(() => {
      onCompleteRef.current = onComplete
    }, [onComplete])

    useEffect(() => {
      if (isSubmitted) return
      const tick = () => {
        const left = secondsLeft(deadline)
        setCount(left)
        if (left === 0) {
          clearInterval(timer)
          onCompleteRef.current()
        }
      }
      const timer = setInterval(tick, 250)
      return () => clearInterval(timer)
    }, [deadline, isSubmitted])

    return (
      <div>
        <h1>Countdown: {count}</h1>
      </div>
    )
  },
)

export default Countdown
