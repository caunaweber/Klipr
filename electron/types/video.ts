export interface VideoInfo {
  id: string
  fileName: string
  videoUrl: string
  sizeMB: number
  duration: number
  width: number
  height: number
  fps: number
  codec: string
}

export type OpenedVideoPayload =
  | {
      ok: true
      videoInfo: VideoInfo
    }
  | {
      ok: false
      error: string
    }
