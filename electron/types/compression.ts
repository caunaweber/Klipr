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
  useTwoPass: boolean
  codec: CompressionCodec
  fps: CompressionFps
  startTime?: number
  endTime?: number
}

export interface CompressionResult {
  outputId: string
  outputPath: string
}

export interface CompressionOptions {
  filePath: string
  targetSizeMB: number
  duration: number

  width: number
  height: number

  startTime?: number
  endTime?: number

  codec: CompressionCodec
  fps: CompressionFps

  onProgress: (progress: number) => void
}
