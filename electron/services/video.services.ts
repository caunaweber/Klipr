import { dialog } from 'electron'
import { createRequire } from 'node:module'
import { execFile, spawn } from 'child_process'
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

export async function compressVideo( filePath: string, targetSizeMB: number, duration: number,
  onProgress: (progress: number) => void
): Promise<string> {

  const audioBitrateKbps = 128
  const audioBits = audioBitrateKbps * 1000 * duration
  const targetBits = targetSizeMB * 1024 * 1024 * 8
  const videoBits = targetBits - audioBits
  const videoBitrate = Math.floor(videoBits / duration)
  const bitrateKbps = Math.floor(videoBitrate / 1000)
  
  if (bitrateKbps < 100) {
  throw new Error(
    'Tamanho alvo muito pequeno para este vídeo'
  )
}

  const parsedFile = path.parse(filePath)

  const outputPath = path.join(
    parsedFile.dir,
    `${parsedFile.name}-compressed.mp4`
  )

  console.log({
    ffmpeg,
    filePath,
    targetSizeMB,
    bitrateKbps,
    outputPath
  })

  return new Promise((resolve, reject) => {

    const ffmpegProcess = spawn(
      ffmpeg,
      [
        '-y',
        '-i',
        filePath,

        '-b:v',
        `${bitrateKbps}k`,

        '-c:v',
        'libx264',

        '-c:a',
        'aac',

        '-progress',
        'pipe:1',

        outputPath
      ]
    )

    console.log('FFmpeg process created')

    ffmpegProcess.stdout.on('data', (data) => {
      const output = data.toString()

      const match =
        output.match(
          /out_time_ms=(\d+)/
        )

      if (match) {

        const currentSeconds =
          Number(match[1]) / 1000000

        const progress =
          Math.min(
            100,
            Math.floor(
              (currentSeconds / duration) * 100
            )
          )

        console.log(
          `Progress: ${progress}%`
        )

        onProgress(progress)
      }
    })

    ffmpegProcess.on('close', (code) => {

      console.log(
        `FFmpeg closed with code ${code}`
      )

      if (code === 0) {

        console.log(
          'Compression finished'
        )

        onProgress(100)

        resolve(outputPath)

      } else {

        reject(
          new Error(
            `FFmpeg exited with code ${code}`
          )
        )
      }
    })
  })
}

