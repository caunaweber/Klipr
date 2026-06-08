export interface CompressionOptions {
  filePath: string
  targetSizeMB: number
  duration: number
  width: number
  height: number
  onProgress: (progress: number) => void
}