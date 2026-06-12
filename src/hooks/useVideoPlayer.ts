import { useCallback, useEffect, useState, type RefObject } from 'react'

interface UseVideoPlayerOptions {
  clipEnd: number
  clipStart: number
  videoRef: RefObject<HTMLVideoElement>
}

export function useVideoPlayer({
  clipEnd,
  clipStart,
  videoRef,
}: UseVideoPlayerOptions) {
  const [currentTime, setCurrentTime] = useState(clipStart)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const pause = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    video.pause()
    setIsPlaying(false)
  }, [videoRef])

  const play = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    if (video.currentTime < clipStart || video.currentTime >= clipEnd) {
      video.currentTime = clipStart
      setCurrentTime(clipStart)
    }

    await video.play()
    setIsPlaying(true)
  }, [clipEnd, clipStart, videoRef])

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pause()
      return
    }

    void play()
  }, [isPlaying, pause, play])

  const seek = useCallback(
    (time: number) => {
      const video = videoRef.current
      if (!video) return

      const nextTime = Math.min(Math.max(time, clipStart), clipEnd)
      video.currentTime = nextTime
      setCurrentTime(nextTime)
    },
    [clipEnd, clipStart, videoRef],
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateMetadata = () => {
      setDuration(Number.isFinite(video.duration) ? video.duration : 0)
      if (video.currentTime < clipStart || video.currentTime > clipEnd) {
        video.currentTime = clipStart
      }
      setCurrentTime(video.currentTime)
    }

    const updateTime = () => {
      if (video.currentTime >= clipEnd) {
        video.currentTime = clipEnd
        video.pause()
        setIsPlaying(false)
      }

      setCurrentTime(video.currentTime)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('loadedmetadata', updateMetadata)
    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handlePause)

    updateMetadata()

    return () => {
      video.removeEventListener('loadedmetadata', updateMetadata)
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handlePause)
    }
  }, [clipEnd, clipStart, videoRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (video.currentTime < clipStart || video.currentTime > clipEnd) {
      video.currentTime = clipStart
      setCurrentTime(clipStart)
    }
  }, [clipEnd, clipStart, videoRef])

  return {
    currentTime,
    duration,
    isPlaying,
    pause,
    play,
    seek,
    togglePlayback,
  }
}
