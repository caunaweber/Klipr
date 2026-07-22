import { dialog } from 'electron'
import { createRequire } from 'node:module'
import { execFile } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'node:path'
import { VideoInfo } from '../types/video'
import { compressVideoFile } from './compression/video-compression.services'
import { CompressionRequest, CompressionResult } from '../types/compression'
import { validateCompressionParameters } from '../utils/compression-validation.utils'
import { getSelectedVideoPath, registerSelectedVideo } from '../utils/selected-video-registry.utils'
import { registerGeneratedOutput } from '../utils/generated-output-registry.utils'
import { resolvePackagedBinaryPath } from '../utils/binary-path.utils'
import { TrimRequest, TrimResult } from '../types/trim'
import { validateTrimParameters } from '../utils/trim-validation.utils'
import { trimVideo } from './trim/trim.services'
import { resolveCompressionEncoder } from './encoder/encoder-selection.services'
import { prepareVideoPreview } from './preview.services'

const execFileAsync = promisify(execFile)

const require = createRequire(import.meta.url)
const ffprobePath = resolvePackagedBinaryPath(
  require('@derhuerst/ffprobe-static')
)

const SUPPORTED_VIDEO_EXTENSIONS = new Set(['.mp4', '.avi', '.mkv', '.mov', '.webm'])

interface FfprobeStream {
  codec_type?: string
  codec_name?: string
  width?: number
  height?: number
  avg_frame_rate?: string
  r_frame_rate?: string
}

interface FfprobeData {
  format: {
    duration?: string
  }
  streams: FfprobeStream[]
}

function assertSupportedVideoExtension(
  filePath: string
) {
  const extension = path.extname(filePath).toLowerCase()

  if (!SUPPORTED_VIDEO_EXTENSIONS.has(extension)) {
    throw new Error('Unsupported video format')
  }
}

function resolveLocalVideoPath(
  filePath: unknown,
  sourceLabel: string
) {
  if (
    typeof filePath !== 'string' ||
    filePath.trim().length === 0
  ) {
    throw new Error(`${sourceLabel} video path is invalid`)
  }

  if (!path.isAbsolute(filePath)) {
    throw new Error(`${sourceLabel} video path must be absolute`)
  }

  const linkStats = fs.lstatSync(filePath)

  if (linkStats.isSymbolicLink()) {
    throw new Error(`${sourceLabel} video cannot be a symbolic link`)
  }

  const resolvedPath = fs.realpathSync(filePath)

  assertSupportedVideoExtension(resolvedPath)

  const stats = fs.statSync(resolvedPath)

  if (!stats.isFile()) {
    throw new Error(`${sourceLabel} item is not a file`)
  }

  return resolvedPath
}

export async function selectVideo(): Promise<VideoInfo | null> {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Videos', extensions: ['mp4', 'avi', 'mkv', 'mov', 'webm'] }
    ]
  })
  if (result.canceled) {
    return null
  }

  const filePath = fs.realpathSync(result.filePaths[0])
  assertSupportedVideoExtension(filePath)

  const previewPath = await prepareVideoPreview(filePath)
  const id = registerSelectedVideo(filePath, previewPath)

  return getVideoInfo(filePath, id)
}

export async function selectDroppedVideo(filePath: unknown): Promise<VideoInfo> {
  return selectLocalVideoPath(filePath, 'Dropped')
}

export async function selectLocalVideoPath(
  filePath: unknown,
  sourceLabel = 'Selected'
): Promise<VideoInfo> {
  const resolvedPath = resolveLocalVideoPath(filePath, sourceLabel)

  const previewPath = await prepareVideoPreview(resolvedPath)
  const id = registerSelectedVideo(resolvedPath, previewPath)

  return getVideoInfo(resolvedPath, id)
}

export async function getVideoInfo(filePath: string, id: string): Promise<VideoInfo> {
  const stats = fs.statSync(filePath)
  const { stdout } = await execFileAsync(
    ffprobePath,
    [
      '-v',
      'quiet',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      filePath
    ]
  )
  const data = JSON.parse(stdout) as FfprobeData
  const videoStream = data.streams.find(
    (stream) => stream.codec_type === 'video'
  )

  if (
    !videoStream ||
    !videoStream.width ||
    !videoStream.height ||
    !videoStream.codec_name ||
    !data.format.duration
  ) {
    throw new Error('Selected file does not contain valid video metadata')
  }

  return {
    id,
    fileName: path.basename(filePath),
    videoUrl: `video://local/${id}`,
    sizeMB: Number((stats.size / (1024 * 1024)).toFixed(2)),
    duration: Number(data.format.duration),
    width: videoStream.width,
    height: videoStream.height,
    fps: parseFrameRate(
      videoStream.avg_frame_rate ||
      videoStream.r_frame_rate
    ),
    codec: videoStream.codec_name
  }
}

function parseFrameRate(
  frameRate: string | undefined
) {
  if (!frameRate) {
    return 0
  }

  const [numeratorText, denominatorText] = frameRate.split('/')
  const numerator = Number(numeratorText)
  const denominator = denominatorText ? Number(denominatorText) : 1

  if (
    !Number.isFinite(numerator) ||
    !Number.isFinite(denominator) ||
    numerator <= 0 ||
    denominator <= 0
  ) {
    return 0
  }

  return Number((numerator / denominator).toFixed(2))
}

export async function compressVideo(
  request: CompressionRequest,
  onProgress: (progress: number) => void
): Promise<CompressionResult> {

  const filePath = getSelectedVideoPath(request.videoId)

  if (!filePath) {
    throw new Error('Video not authorized')
  }

  const encoder = await resolveCompressionEncoder(request.encoderId)

  const videoInfo = await getVideoInfo(filePath, request.videoId)

  const resolvedStartTime = request.startTime ?? 0
  const resolvedEndTime = request.endTime ?? videoInfo.duration

  validateCompressionParameters({
    codec: encoder.codec,
    targetSizeMB: request.targetSizeMB,
    sourceSizeMB: videoInfo.sizeMB,
    duration: videoInfo.duration,
    startTime: resolvedStartTime,
    endTime: resolvedEndTime,
    width: videoInfo.width,
    height: videoInfo.height,
    sourceFps: videoInfo.fps,
    fps: request.fps,
  })

  const outputPath = await compressVideoFile({
    filePath,
    targetSizeMB: request.targetSizeMB,
    duration: videoInfo.duration,
    width: videoInfo.width,
    height: videoInfo.height,
    encoder,
    fps: request.fps,
    onProgress,
    startTime: resolvedStartTime,
    endTime: resolvedEndTime,
  })
  const outputSizeMB = Number((fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2))

  return {
    outputId: registerGeneratedOutput(outputPath),
    outputPath,
    outputSizeMB,
  }
}

export async function trimSelectedVideo(
  request: TrimRequest
): Promise<TrimResult> {
  const filePath = getSelectedVideoPath(request.videoId)

  if (!filePath) {
    throw new Error('Video not authorized')
  }

  const videoInfo = await getVideoInfo(filePath, request.videoId)

  validateTrimParameters({
    duration: videoInfo.duration,
    startTime: request.startTime,
    endTime: request.endTime,
  })

  const outputPath = await trimVideo({
    filePath,
    startTime: request.startTime,
    endTime: request.endTime,
  })

  return {
    outputId: registerGeneratedOutput(outputPath),
    outputPath,
  }
}
