import { useCallback, useEffect, useRef, useState } from 'react'
import type { CompressionCodec, CompressionFps, CompressionResult } from '../../electron/types/compression'
import type { TrimResult } from '../../electron/types/trim'
import type { VideoInfo } from '../../electron/types/video'

type VideoOperationStatus =
  | 'idle'
  | 'loading-video'
  | 'compressing'
  | 'trimming'
  | 'cancelling'
  | 'success'
  | 'error'
  | 'cancelled'
type ExportKind = 'compression' | 'trim'
type ExportResult = CompressionResult | TrimResult
const SUPPORTED_VIDEO_EXTENSIONS = ['.mp4', '.avi', '.mkv', '.mov', '.webm']

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

  if (errorText.includes('A video operation is already active')) {
    return 'Another video operation is already running.'
  }

  if (errorText.includes('Video not authorized')) {
    return 'This video is no longer available. Select it again.'
  }

  if (errorText.includes('Invalid clip duration')) {
    return 'The selected trim range is invalid. Reset trim and try again.'
  }

  if (errorText.includes('fps must be smaller than or equal to the source fps')) {
    return 'Selected FPS cannot be higher than the source video FPS.'
  }

  if (errorText.includes('FFmpeg exited')) {
    return 'FFmpeg could not compress this video. Try a different codec or target size.'
  }

  return 'Compression failed. Check the settings and try again.'
}

function getTrimErrorMessage(error: unknown) {
  const errorText = getErrorText(error)

  if (
    errorText.includes('ENOENT') ||
    errorText.includes('no such file or directory') ||
    errorText.includes('cannot find the file')
  ) {
    return 'Selected video file could not be found. Select it again.'
  }

  if (errorText.includes('A video operation is already active')) {
    return 'Another video operation is already running.'
  }

  if (errorText.includes('Video not authorized')) {
    return 'This video is no longer available. Select it again.'
  }

  if (
    errorText.includes('Invalid clip duration') ||
    errorText.includes('Invalid trim parameters')
  ) {
    return 'The selected trim range is invalid. Reset trim and try again.'
  }

  if (errorText.includes('FFmpeg trim exited')) {
    return 'Could not export trimmed clip.'
  }

  return 'Could not export trimmed clip.'
}

export function useVideoCompression() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [targetSizeMB, setTargetSizeMB] = useState('10')
  const [progress, setProgress] = useState(0)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isTrimming, setIsTrimming] = useState(false)
  const [isSelectingVideo, setIsSelectingVideo] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [codec, setCodec] = useState<CompressionCodec>('h265')
  const [fps, setFps] = useState<CompressionFps>('native')
  const [clipStart, setClipStart] = useState(0)
  const [clipEnd, setClipEnd] = useState(0)
  const [status, setStatus] = useState<VideoOperationStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [exportResult, setExportResult] =
    useState<ExportResult | null>(null)
  const [exportKind, setExportKind] = useState<ExportKind | null>(null)
  const cancelRequestedRef = useRef(false)
  const isVideoOperationActiveRef = useRef(false)

  const isVideoOperationActive =
    isCompressing || isTrimming || isCancelling

  const applySelectedVideo = useCallback((info: VideoInfo) => {
    setVideoInfo(info)
    setClipStart(0)
    setClipEnd(info.duration)
    setProgress(0)
    setFps('native')
    setExportResult(null)
    setExportKind(null)
    setStatus('idle')
    setMessage(null)
  }, [])

  const applyOpenVideoError = useCallback(() => {
    setStatus('error')
    setMessage('Could not load this video. Try another local video file.')
  }, [])

  const applyOpenVideoBlocked = useCallback(() => {
    setMessage('Finish the current video operation before opening another video.')
  }, [])

  const clearVideo = () => {
    setVideoInfo(null)
    setClipStart(0)
    setClipEnd(0)
    setProgress(0)
    setFps('native')
    setExportResult(null)
    setExportKind(null)
    setStatus('idle')
    setMessage(null)
  }

  const notify = async (body: string, title = 'Klipr') => {
    try {
      await window.videoCompressor.notify({ title, body })
    } catch (error) {
      console.error(error)
    }
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
      setMessage('Drop a video file.')
    } finally {
      setIsSelectingVideo(false)
    }
  }

  const cancelVideoOperation = async () => {
    if (!isCompressing || isCancelling) return

    setIsCancelling(true)
    cancelRequestedRef.current = true
    setStatus('cancelling')
    setMessage('Cancelling compression...')

    try {
      await window.videoCompressor.cancelVideoOperation()
    } catch (error) {
      console.error(error)
      setStatus('error')
      setMessage('Could not cancel the current operation. Please try again.')
      setIsCancelling(false)
    }
  }

  const compressVideo = async () => {
    if (!videoInfo || isVideoOperationActive) return

    setIsCompressing(true)
    setIsCancelling(false)
    cancelRequestedRef.current = false
    setStatus('compressing')
    setMessage(null)

    try {
      setProgress(0)
      setExportResult(null)
      setExportKind(null)

      const result = await window.videoCompressor.compressVideo({
        videoId: videoInfo.id,
        targetSizeMB: Number(targetSizeMB),
        codec,
        fps,
        startTime: clipStart,
        endTime: clipEnd,
      })

      setExportResult(result)
      setExportKind('compression')
      setStatus('success')
      setMessage(null)
      void notify('Your compressed video is ready.', 'Compression complete')

    } catch (error) {

      console.error(error)
      setExportResult(null)
      setExportKind(null)
      setProgress(0)

      const wasCancelled = cancelRequestedRef.current
      const errorMessage = wasCancelled

        ? 'Compression cancelled.'
        : getCompressionErrorMessage(error)

      setStatus(wasCancelled ? 'cancelled' : 'error')

      if (wasCancelled) {
        setMessage(errorMessage)
      } else {
        setMessage(null)
        void notify(errorMessage, 'Compression failed')
      }

    } finally {
      setIsCompressing(false)
      setIsCancelling(false)
      cancelRequestedRef.current = false
    }
  }

  const trimVideo = async () => {
    if (!videoInfo || isVideoOperationActive) return

    setIsTrimming(true)
    setStatus('trimming')
    setMessage(null)

    try {
      setExportResult(null)
      setExportKind(null)

      const result = await window.videoCompressor.trimVideo({
        videoId: videoInfo.id,
        startTime: clipStart,
        endTime: clipEnd,
      })

      setExportResult(result)
      setExportKind('trim')
      setStatus('success')
      setMessage(null)
      void notify('Clip exported.', 'Trim complete')

    } catch (error) {

      console.error(error)
      setExportResult(null)
      setExportKind(null)

      const errorMessage = getTrimErrorMessage(error)

      setStatus('error')
      setMessage(null)
      void notify(errorMessage, 'Trim failed')

    } finally {
      setIsTrimming(false)
    }
  }

  const openResultFolder = async () => {
    if (!exportResult) return

    try {
      await window.videoCompressor.openResultFolder(exportResult.outputId)
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

  useEffect(() => {
    isVideoOperationActiveRef.current = isVideoOperationActive
  }, [isVideoOperationActive])

  useEffect(() => {
    let isMounted = true

    const loadPendingOpenVideo = async () => {
      setIsSelectingVideo(true)
      setStatus('loading-video')
      setMessage(null)

      try {
        const info = await window.videoCompressor.consumePendingOpenVideo()

        if (!isMounted) {
          return
        }

        if (info) {
          applySelectedVideo(info)
        } else {
          setStatus('idle')
        }
      } catch (error) {
        console.error(error)

        if (isMounted) {
          applyOpenVideoError()
        }
      } finally {
        if (isMounted) {
          setIsSelectingVideo(false)
        }
      }
    }

    const unsubscribe = window.videoCompressor.onOpenedFromSystem((payload) => {
      if (isVideoOperationActiveRef.current) {
        applyOpenVideoBlocked()
        return
      }

      if (payload.ok) {
        applySelectedVideo(payload.videoInfo)
        return
      }

      console.error(payload.error)

      if (payload.error.includes('A video operation is already active')) {
        applyOpenVideoBlocked()
        return
      }

      applyOpenVideoError()
    })

    void loadPendingOpenVideo()

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [
    applyOpenVideoBlocked,
    applyOpenVideoError,
    applySelectedVideo,
  ])

  return {
    clipEnd,
    clipStart,
    codec,
    fps,
    cancelVideoOperation,
    clearVideo,
    compressVideo,
    dismissMessage,
    exportKind,
    exportResult,
    isCancelling,
    isCompressing,
    isSelectingVideo,
    isTrimming,
    isVideoOperationActive,
    message,
    openResultFolder,
    progress,
    selectDroppedVideo,
    selectVideo,
    setClipEnd,
    setClipStart,
    setCodec,
    setFps,
    setTargetSizeMB,
    showPreviewError,
    status,
    targetSizeMB,
    trimVideo,
    videoInfo,
  }
}
