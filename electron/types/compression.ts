export type CompressionCodec =
  | 'h264'
  | 'h265'


export interface CompressionOptions {
  filePath: string
  targetSizeMB: number
  duration: number

  width: number
  height: number

  startTime?: number
  endTime?: number

  codec: CompressionCodec

  onProgress: (progress: number) => void
}