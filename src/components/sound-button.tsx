import useSound from "use-sound"
import { memo } from "react"

const SoundButton = memo(({ label, url }: { label: string; url: string }) => {
  const [play] = useSound(url)

  return <button onClick={play}>{label}</button>
})

export default SoundButton
