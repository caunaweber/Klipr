import { dialog } from 'electron'
import { createRequire } from 'node:module'
import { execFile } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'node:path'
import { VideoInfo } from '../../src/types/video'

const execFileAsync = promisify(execFile)

const require = createRequire(import.meta.url)
const ffprobe = require('ffprobe-static')
const ffmpeg = require('ffmpeg-static')


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

export async function compressVideo(filePath: string, targetSizeMB: number, duration: number): Promise<string> {
  const targetBits = targetSizeMB * 1024 * 1024 * 8
  const videoBitrate = Math.floor(targetBits / duration)
  const bitrateKbps = Math.floor(videoBitrate / 1000)
  const parsedFile = path.parse(filePath)
  const outputPath = path.join(parsedFile.dir, `${parsedFile.name}-compressed.mp4`)

  console.log({
    targetSizeMB,
    duration,
    bitrateKbps,
    outputPath
  })

  await execFileAsync(
    ffmpeg,
    [
      '-i',
      filePath,

      '-b:v',
      `${bitrateKbps}k`,

      '-c:v',
      'libx264',

      '-c:a',
      'aac',

      outputPath
    ]
  )
  return outputPath
}