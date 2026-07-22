import type { EncoderId } from './encoder'
import type { EncoderDefinition } from '../utils/encoder.utils'

export type CompressionCodec =
  | 'h264'
  | 'h265'

export type CompressionFps =
  | 'native'
  | 30
  | 60
  | 120

export interface CompressionRequest {
  videoId: string
  targetSizeMB: number
  encoderId: EncoderId
  fps: CompressionFps
  startTime?: number
  endTime?: number
}

export interface CompressionResult {
  outputId: string
  outputPath: string
  outputSizeMB: number
}

export interface CompressionOptions {
  filePath: string
  targetSizeMB: number
  duration: number

  width: number
  height: number

  startTime?: number
  endTime?: number

  encoder: EncoderDefinition
  fps: CompressionFps

  onProgress: (progress: number) => void
}
