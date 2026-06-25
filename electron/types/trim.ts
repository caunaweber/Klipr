export interface TrimRequest {
  videoId: string
  startTime: number
  endTime: number
}

export interface TrimOptions {
  filePath: string
  startTime: number
  endTime: number
  onProgress: (progress: number) => void
}

export interface TrimResult {
  outputId: string
  outputPath: string
}