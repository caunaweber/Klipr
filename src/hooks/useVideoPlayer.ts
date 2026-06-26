import { useCallback, useEffect, useState, type RefObject } from 'react'

interface UseVideoPlayerOptions {
  clipEnd: number
  clipStart: number
  sourceKey?: string | null
  videoRef: RefObject<HTMLVideoElement>
}

export function useVideoPlayer({
  clipEnd,
  clipStart,
  sourceKey,
  videoRef,
}: UseVideoPlayerOptions) {
  const END_TIME_EPSILON = 0.05
  const [currentTime, setCurrentTime] = useState(clipStart)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)

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

  const changeVolume = useCallback(
    (nextVolume: number) => {
      const clampedVolume = Math.min(Math.max(nextVolume, 0), 1)
      const video = videoRef.current

      setVolume(clampedVolume)
      setIsMuted(clampedVolume === 0)

      if (!video) return

      video.volume = clampedVolume
      video.muted = clampedVolume === 0
    },
    [videoRef],
  )

  const toggleMute = useCallback(() => {
    const video = videoRef.current

    if (isMuted || volume === 0) {
      const restoredVolume = volume === 0 ? 0.5 : volume

      setVolume(restoredVolume)
      setIsMuted(false)

      if (!video) return

      video.volume = restoredVolume
      video.muted = false
      return
    }

    setIsMuted(true)

    if (!video) return

    video.muted = true
  }, [isMuted, videoRef, volume])

  useEffect(() => {
    const video = videoRef.current

    setIsPlaying(false)
    setVolume(0.5)
    setIsMuted(false)

    if (!video) return

    video.pause()
    video.volume = 0.5
    video.muted = false
  }, [sourceKey, videoRef])

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
      if (video.currentTime >= clipEnd - END_TIME_EPSILON) {
        video.pause()
        setIsPlaying(false)
        setCurrentTime(clipEnd)
        return
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
  }, [clipEnd, clipStart, sourceKey, videoRef])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const applyAudioSettings = () => {
      video.volume = volume
      video.muted = isMuted || volume === 0
    }

    video.addEventListener('loadedmetadata', applyAudioSettings)
    video.addEventListener('loadeddata', applyAudioSettings)

    applyAudioSettings()

    return () => {
      video.removeEventListener('loadedmetadata', applyAudioSettings)
      video.removeEventListener('loadeddata', applyAudioSettings)
    }
  }, [isMuted, videoRef, volume])

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
    changeVolume,
    duration,
    isMuted,
    isPlaying,
    pause,
    play,
    seek,
    togglePlayback,
    toggleMute,
    volume,
  }
}
