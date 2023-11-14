import clsx from "clsx"
import { memo } from "react"
import readyButton from "../../public/images/ready-button.webp"
import Image from "next/image"
// @ts-ignore
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
        "cursor-pointer transition-all duration-500 ease-out hover:translate-y-1.5 active:translate-y-2.5  active:transform",
        {
          "pointer-events-none grayscale": disabled,
        },
      )}
    />
  )
})

export default ReadyButton
