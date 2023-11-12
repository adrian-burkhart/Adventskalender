import { memo, useEffect, useState } from "react"

const Countdown = memo(
  ({
    time,
    onComplete,
    isSubmitted,
  }: {
    isSubmitted: boolean
    time: number
    onComplete: (e?: React.FormEvent<HTMLFormElement>) => void
  }) => {
    const [count, setCount] = useState(time)

    useEffect(() => {
      if (isSubmitted || count <= 0) {
        if (count === 0 && !isSubmitted) {
          onComplete()
        }
        return
      }

      const timer = setTimeout(() => setCount(count - 1), 1000)
      return () => clearTimeout(timer)
    }, [onComplete, count, isSubmitted])

    return (
      <div>
        <h1>Countdown: {count}</h1>
      </div>
    )
  },
)

export default Countdown
