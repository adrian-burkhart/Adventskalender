// @ts-ignore
import { memo, useRef, useState } from "react"
import { Pause, Play } from "phosphor-react"
import ReactAudioPlayer from "react-audio-player"

export const PlayPauseButton = memo(
  ({
    isPlaying,
    smallButton,
    pauseAudio,
    playAudio,
  }: {
    smallButton: boolean
    isPlaying: boolean
    pauseAudio: () => void
    playAudio: () => void
  }) => {
    if (isPlaying) {
      return (
        <button onClick={pauseAudio}>
          <Pause
            weight="fill"
            size={smallButton ? 24 : 128}
            className="text-yellow-200"
          />
        </button>
      )
    }

    return (
      <button onClick={playAudio}>
        <Play
          weight="fill"
          size={smallButton ? 24 : 128}
          className="text-yellow-200"
        />
      </button>
    )
  },
)

const AudioPlayer = memo(
  ({
    onEnded,
    smallButton = false,
    label,
    autoPlay = false,
    hideButton = false,
    url,
  }: {
    autoPlay?: boolean
    onEnded?: () => void
    label?: string
    smallButton?: boolean
    url: string
    hideButton?: boolean
  }) => {
    const audioPlayerRef = useRef<ReactAudioPlayer>(null)
    const [isPlaying, setIsPlaying] = useState(autoPlay)

    const playAudio = () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.audioEl.current?.play()
        setIsPlaying(true)
      }
    }

    const pauseAudio = () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.audioEl.current?.pause()
        setIsPlaying(false)
      }
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (onEnded) {
        onEnded()
      }
    }

    return (
      <div className="flex items-center justify-center">
        {label && <div>{label}</div>}
        <ReactAudioPlayer
          autoPlay={autoPlay}
          onEnded={handleEnded}
          src={url}
          ref={audioPlayerRef}
        />
        {!hideButton && (
          <PlayPauseButton
            smallButton={smallButton}
            isPlaying={isPlaying}
            pauseAudio={pauseAudio}
            playAudio={playAudio}
          />
        )}
      </div>
    )
  },
)

export default AudioPlayer
