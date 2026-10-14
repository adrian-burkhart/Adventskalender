"use client"

import { memo, useRef, useState } from "react"
import pauseButton from "../../public/images/pause-button.webp"
import playButton from "../../public/images/play-button.webp"
import Image from "next/image"

/**
 * The painted play and pause buttons share one canvas with the ball in the
 * same place, so switching between them doesn't make the button jump.
 */
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
    return (
      <button
        type="button"
        onClick={isPlaying ? pauseAudio : playAudio}
        className="rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold/60"
      >
        <Image
          src={isPlaying ? pauseButton : playButton}
          alt={isPlaying ? "Pause button" : "Play button"}
          width={smallButton ? 40 : 280}
          priority={!smallButton}
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
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isPlaying, setIsPlaying] = useState(autoPlay)

    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }

    const pauseAudio = () => {
      if (audioRef.current) {
        audioRef.current.pause()
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
        <audio
          autoPlay={autoPlay}
          onEnded={handleEnded}
          src={url}
          ref={audioRef}
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
