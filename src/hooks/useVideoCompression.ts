import { useEffect, useState } from 'react'
import type { CompressionCodec, CompressionResult } from '../../electron/types/compression'
import type { VideoInfo } from '../../electron/types/video'

export function useVideoCompression() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [targetSizeMB, setTargetSizeMB] = useState('10')
  const [progress, setProgress] = useState(0)
  const [useTwoPass, setUseTwoPass] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [codec, setCodec] = useState<CompressionCodec>('h265')
  const [clipStart, setClipStart] = useState(0)
  const [clipEnd, setClipEnd] = useState(0)
  const [compressionResult, setCompressionResult] =
    useState<CompressionResult | null>(null)

  const selectVideo = async () => {
    const info = await window.videoCompressor.selectVideo()

    if (!info) {
      setVideoInfo(null)
      setCompressionResult(null)
      setProgress(0)
      return
    }

    setVideoInfo(info)
    setClipStart(0)
    setClipEnd(info.duration)
    setProgress(0)
    setCompressionResult(null)
  }

  const compressVideo = async () => {
    if (!videoInfo) return

    setIsCompressing(true)

    try {
      setProgress(0)
      setCompressionResult(null)

      const result = await window.videoCompressor.compressVideo({
        videoId: videoInfo.id,
        targetSizeMB: Number(targetSizeMB),
        useTwoPass,
        codec,
        startTime: clipStart,
        endTime: clipEnd,
      })

      setCompressionResult(result)
    } catch (error) {
      console.error(error)
    } finally {
      setIsCompressing(false)
    }
  }

  useEffect(() => {
    const unsubscribe = window.videoCompressor.onProgress(setProgress)
    return unsubscribe
  }, [])

  return {
    clipEnd,
    clipStart,
    codec,
    compressVideo,
    compressionResult,
    isCompressing,
    progress,
    selectVideo,
    setClipEnd,
    setClipStart,
    setCodec,
    setTargetSizeMB,
    setUseTwoPass,
    targetSizeMB,
    useTwoPass,
    videoInfo,
  }
}
