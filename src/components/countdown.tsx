import { memo, useEffect, useRef, useState } from "react"

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
    const onCompleteRef = useRef(onComplete)

    useEffect(() => {
      onCompleteRef.current = onComplete
    }, [onComplete])

    useEffect(() => {
      setCount(time)
    }, [time])

    useEffect(() => {
      if (isSubmitted || count <= 0) {
        if (count === 0 && !isSubmitted) {
          onCompleteRef.current()
        }
        return
      }

      const timer = setTimeout(() => setCount((prev) => prev - 1), 1000)
      return () => clearTimeout(timer)
    }, [count, isSubmitted])

    return (
      <div>
        <h1>Countdown: {count}</h1>
      </div>
    )
  },
)

export default Countdown
