import { dialog } from 'electron'
import { createRequire } from 'node:module'
import { execFile} from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'node:path'
import { VideoInfo } from '../types/video'
import { onePassCompression } from './compression/one-pass.compression'
import { twoPassCompression } from './compression/two-pass.compression'
import { CompressionCodec} from '../types/compression'
import { validateCompressionParameters } from '../utils/compression-validation.utils'


const execFileAsync = promisify(execFile)

const require = createRequire(import.meta.url)
const ffprobe = require('ffprobe-static')


export async function selectVideo(): Promise<string | null> {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Videos', extensions: ['mp4', 'avi', 'mkv'] }
    ]
  })
  if (result.canceled) {
    return null
  }

  return result.filePaths[0]
}

export async function getVideoInfo(filePath: string): Promise<VideoInfo> {
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
  const data = JSON.parse(stdout)
  const videoStream = data.streams.find(
    (stream: any) => stream.codec_type === 'video'
  )
  return {
    fileName: path.basename(filePath),
    filePath,
    sizeMB: Number((stats.size / (1024 * 1024)).toFixed(2)),
    duration: Number(data.format.duration),
    width: videoStream.width,
    height: videoStream.height,
    codec: videoStream.codec_name
  }
}

export async function compressVideo(filePath: string, targetSizeMB: number, duration: number, width: number,
  height: number , useTwoPass: boolean, codec: CompressionCodec, onProgress: (progress: number) => void, startTime?: number, endTime?: number): Promise<string> {

  const resolvedStartTime = startTime ?? 0
  const resolvedEndTime = endTime ?? duration

  validateCompressionParameters({
    targetSizeMB,
    startTime: resolvedStartTime,
    endTime: resolvedEndTime,
    width,
    height
  })

  if (useTwoPass) {
    return twoPassCompression({
      filePath,
      targetSizeMB,
      duration,
      width,
      height,
      codec,
      onProgress,
      startTime: resolvedStartTime,
      endTime: resolvedEndTime
    })

  }
  return onePassCompression({
    filePath,
    targetSizeMB,
    duration,
    width,
    height,
    codec,
    onProgress,
    startTime: resolvedStartTime,
    endTime: resolvedEndTime
  })
}
