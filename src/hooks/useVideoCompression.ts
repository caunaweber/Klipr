import { useCallback, useEffect, useRef, useState } from 'react'
import type { CompressionCodec, CompressionResult } from '../../electron/types/compression'
import type { VideoInfo } from '../../electron/types/video'

type CompressionStatus = 'idle' | 'loading-video' | 'compressing' | 'cancelling' | 'success' | 'error' | 'cancelled'
const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mkv']

function getErrorText(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function getCompressionErrorMessage(error: unknown) {
  const errorText = getErrorText(error)

  if (
    errorText.includes('ENOENT') ||
    errorText.includes('no such file or directory') ||
    errorText.includes('cannot find the file')
  ) {
    return 'Selected video file could not be found. Select it again.'
  }

  if (errorText.includes('Target size is too small')) {
    return 'Target size is too small for this video. Try a larger size or a shorter trim.'
  }

  if (errorText.includes('A compression is already active')) {
    return 'A compression is already running.'
  }

  if (errorText.includes('Video not authorized')) {
    return 'This video is no longer available. Select it again.'
  }

  if (errorText.includes('Invalid clip duration')) {
    return 'The selected trim range is invalid. Reset trim and try again.'
  }

  if (
    errorText.includes('FFmpeg exited') ||
    errorText.includes('First pass failed')
  ) {
    return 'FFmpeg could not compress this video. Try a different codec or target size.'
  }

  return 'Compression failed. Check the settings and try again.'
}

export function useVideoCompression() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [targetSizeMB, setTargetSizeMB] = useState('10')
  const [progress, setProgress] = useState(0)
  const [useTwoPass, setUseTwoPass] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isSelectingVideo, setIsSelectingVideo] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [codec, setCodec] = useState<CompressionCodec>('h265')
  const [clipStart, setClipStart] = useState(0)
  const [clipEnd, setClipEnd] = useState(0)
  const [status, setStatus] = useState<CompressionStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [compressionResult, setCompressionResult] =
    useState<CompressionResult | null>(null)
  const cancelRequestedRef = useRef(false)

  const applySelectedVideo = (info: VideoInfo) => {
    setVideoInfo(info)
    setClipStart(0)
    setClipEnd(info.duration)
    setProgress(0)
    setCompressionResult(null)
    setStatus('idle')
    setMessage(null)
  }

  const clearVideo = () => {
    setVideoInfo(null)
    setClipStart(0)
    setClipEnd(0)
    setProgress(0)
    setCompressionResult(null)
    setStatus('idle')
    setMessage(null)
  }

  const selectVideo = async () => {
    setIsSelectingVideo(true)
    setStatus('loading-video')
    setMessage(null)

    try {
      const info = await window.videoCompressor.selectVideo()

      if (!info) {
        setStatus('idle')
        return
      }

      applySelectedVideo(info)
    } catch (error) {
      console.error(error)
      setStatus('error')
      setMessage('Could not load this video. Try another local video file.')
    } finally {
      setIsSelectingVideo(false)
    }
  }

  const selectDroppedVideo = async (file: File) => {
    setIsSelectingVideo(true)
    setStatus('loading-video')
    setMessage(null)

    try {
      const normalizedName = file.name.toLowerCase()
      const isSupported = SUPPORTED_VIDEO_EXTENSIONS.some((extension) =>
        normalizedName.endsWith(extension),
      )

      if (!isSupported) {
        throw new Error('Unsupported video format')
      }

      const info = await window.videoCompressor.selectDroppedVideo(file)

      applySelectedVideo(info)
    } catch (error) {
      console.error(error)
      setStatus('error')
      setMessage('Drop a local MP4, AVI, or MKV video file.')
    } finally {
      setIsSelectingVideo(false)
    }
  }

  const cancelCompression = async () => {
    if (!isCompressing || isCancelling) return

    setIsCancelling(true)
    cancelRequestedRef.current = true
    setStatus('cancelling')
    setMessage('Cancelling compression...')

    try {
      await window.videoCompressor.cancelCompression()
    } catch (error) {
      console.error(error)
      setStatus('error')
      setMessage('Could not cancel compression. Please try again.')
      setIsCancelling(false)
    }
  }

  const compressVideo = async () => {
    if (!videoInfo) return

    setIsCompressing(true)
    setIsCancelling(false)
    cancelRequestedRef.current = false
    setStatus('compressing')
    setMessage(null)

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
      setStatus('success')
      setMessage('Compression complete. Your video is ready.')
    } catch (error) {
      console.error(error)
      setCompressionResult(null)
      setProgress(0)
      setStatus(cancelRequestedRef.current ? 'cancelled' : 'error')
      setMessage(
        cancelRequestedRef.current
          ? 'Compression cancelled.'
          : getCompressionErrorMessage(error),
      )
    } finally {
      setIsCompressing(false)
      setIsCancelling(false)
      cancelRequestedRef.current = false
    }
  }

  const openResultFolder = async () => {
    if (!compressionResult) return

    try {
      await window.videoCompressor.openResultFolder(compressionResult.outputId)
    } catch (error) {
      console.error(error)
      setStatus('error')
      setMessage('Could not open the output folder.')
    }
  }

  const showPreviewError = useCallback(() => {
    setStatus('error')
    setMessage('Could not preview this video. Try selecting it again.')
  }, [])

  const dismissMessage = useCallback(() => {
    setMessage(null)

    if (status === 'error' || status === 'cancelled') {
      setStatus('idle')
    }
  }, [status])

  useEffect(() => {
    const unsubscribe = window.videoCompressor.onProgress(setProgress)
    return unsubscribe
  }, [])

  return {
    clipEnd,
    clipStart,
    codec,
    cancelCompression,
    clearVideo,
    compressVideo,
    compressionResult,
    dismissMessage,
    isCancelling,
    isCompressing,
    isSelectingVideo,
    message,
    openResultFolder,
    progress,
    selectDroppedVideo,
    selectVideo,
    setClipEnd,
    setClipStart,
    setCodec,
    setTargetSizeMB,
    setUseTwoPass,
    showPreviewError,
    status,
    targetSizeMB,
    useTwoPass,
    videoInfo,
  }
}
