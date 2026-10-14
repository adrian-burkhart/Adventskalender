"use client"

import clsx from "clsx"
import { memo } from "react"
import readyButton from "../../public/images/ready-button.webp"
import Image from "next/image"
import useSound from "use-sound"

interface ReadyButtonProps {
  disabled?: boolean
  onClick: () => void
}

const ReadyButton = memo(({ disabled, onClick }: ReadyButtonProps) => {
  const [play] = useSound("/sounds/click.wav")

  const handleClick = () => {
    play()
    onClick()
  }

  return (
    <Image
      src={readyButton}
      alt="Bereit button"
      width={300}
      onClick={handleClick}
      className={clsx(
        "cursor-pointer drop-shadow-[0_10px_12px_rgba(0,0,0,0.55)] transition-all duration-500 ease-out hover:translate-y-1.5 hover:drop-shadow-[0_5px_8px_rgba(0,0,0,0.5)] active:translate-y-2.5 active:transform",
        {
          "pointer-events-none grayscale": disabled,
        },
      )}
    />
  )
})

export default ReadyButton
