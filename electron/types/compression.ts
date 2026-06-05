export interface CompressionOptions {
  filePath: string
  targetSizeMB: number
  duration: number
  onProgress: (progress: number) => void
}