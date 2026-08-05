export interface TrimRequest {
  videoId: string
  startTime: number
  endTime: number
}

export interface TrimOptions {
  filePath: string
  startTime: number
  endTime: number
  audioTracksCount: number
}

export interface TrimResult {
  outputId: string
  outputPath: string
}
