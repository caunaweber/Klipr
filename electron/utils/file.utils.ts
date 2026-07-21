import path from 'node:path'
import fs from 'node:fs/promises'
import { CompressionCodec, CompressionFps } from '../types/compression'
import type { EncoderTechnology } from '../types/encoder'

export function buildOutputPath(
  filePath: string,
  codec: CompressionCodec,
  targetSizeMB: number,
  fps: CompressionFps = 'native',
  technology: EncoderTechnology = 'cpu',
): string {

  const parsedFile = path.parse(filePath)

  const sizeLabel =
    targetSizeMB
      .toString()
      .replace('.', '_')

  const codecName =
    codec === 'h265'
      ? 'hevc'
      : 'avc'

  const fpsLabel =
    fps === 'native'
      ? ''
      : `-${fps}fps`

  const technologyLabel =
    technology === 'cpu'
      ? ''
      : `-${technology}`

  return path.join(
    parsedFile.dir,
    `${parsedFile.name}-${codecName}-${sizeLabel}MB${fpsLabel}${technologyLabel}-compressed.mp4`
  )
}

export function buildTrimOutputPath(
  filePath: string,
  startTime: number,
  endTime: number
): string {
  const parsedFile = path.parse(filePath)

  const startLabel = formatTimeForFileName(startTime)
  const endLabel = formatTimeForFileName(endTime)

  return path.join(
    parsedFile.dir,
    `${parsedFile.name}-trim-${startLabel}-${endLabel}.mp4`
  )
}

function formatTimeForFileName(seconds: number) {
  const totalSeconds = Math.floor(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60

  return `${minutes.toString().padStart(2, '0')}_${remainingSeconds
    .toString()
    .padStart(2, '0')}`
}

export async function removeFileIfExists(filePath: string) {
  try {
    await fs.unlink(filePath)
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as NodeJS.ErrnoException).code === 'ENOENT'
    ) {
      return
    }

    throw error
  }
}

export async function removeFileIfExistsBestEffort(filePath: string) {
  try {
    await removeFileIfExists(filePath)
  } catch (error) {
    console.warn(
      'Could not remove incomplete output file:',
      error
    )
  }
}
