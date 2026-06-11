import { dialog } from 'electron'
import { createRequire } from 'node:module'
import { execFile } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'node:path'
import { VideoInfo } from '../types/video'
import { onePassCompression } from './compression/one-pass.compression'
import { twoPassCompression } from './compression/two-pass.compression'
import { CompressionRequest, CompressionResult } from '../types/compression'
import { validateCompressionParameters } from '../utils/compression-validation.utils'
import { getSelectedVideoPath, registerSelectedVideo } from '../utils/selected-video-registry.utils'
import { registerGeneratedOutput } from '../utils/generated-output-registry.utils'

const execFileAsync = promisify(execFile)

const require = createRequire(import.meta.url)
const ffprobe = require('ffprobe-static')


interface FfprobeStream {
  codec_type?: string
  codec_name?: string
  width?: number
  height?: number
}

interface FfprobeData {
  format: {
    duration?: string
  }
  streams: FfprobeStream[]
}

export async function selectVideo(): Promise<VideoInfo | null> {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Videos', extensions: ['mp4', 'avi', 'mkv'] }
    ]
  })
  if (result.canceled) {
    return null
  }

  const filePath = result.filePaths[0]
  const id = registerSelectedVideo(filePath)

  return getVideoInfo(filePath, id)
}

export async function getVideoInfo(filePath: string, id: string): Promise<VideoInfo> {
  const stats = fs.statSync(filePath)
  const { stdout } = await execFileAsync(
    ffprobe.path,
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
    videoUrl: `video://${id}`,
    sizeMB: Number((stats.size / (1024 * 1024)).toFixed(2)),
    duration: Number(data.format.duration),
    width: videoStream.width,
    height: videoStream.height,
    codec: videoStream.codec_name
  }
}

export async function compressVideo(
  request: CompressionRequest,
  onProgress: (progress: number) => void
): Promise<CompressionResult> {

  const filePath = getSelectedVideoPath(request.videoId)

  if (!filePath) {
    throw new Error('Video not authorized')
  }

  const videoInfo = await getVideoInfo(filePath, request.videoId)

  const resolvedStartTime = request.startTime ?? 0
  const resolvedEndTime = request.endTime ?? videoInfo.duration

  validateCompressionParameters({
    codec: request.codec,
    targetSizeMB: request.targetSizeMB,
    sourceSizeMB: videoInfo.sizeMB,
    duration: videoInfo.duration,
    startTime: resolvedStartTime,
    endTime: resolvedEndTime,
    width: videoInfo.width,
    height: videoInfo.height
  })

  const outputPath = request.useTwoPass
    ? await twoPassCompression({
      filePath,
      targetSizeMB: request.targetSizeMB,
      duration: videoInfo.duration,
      width: videoInfo.width,
      height: videoInfo.height,
      codec: request.codec,
      onProgress,
      startTime: resolvedStartTime,
      endTime: resolvedEndTime
    })
    : await onePassCompression({
      filePath,
      targetSizeMB: request.targetSizeMB,
      duration: videoInfo.duration,
      width: videoInfo.width,
      height: videoInfo.height,
      codec: request.codec,
      onProgress,
      startTime: resolvedStartTime,
      endTime: resolvedEndTime
    })

  return {
    outputId: registerGeneratedOutput(outputPath),
    outputPath
  }
}
