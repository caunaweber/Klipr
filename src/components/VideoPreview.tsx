import type { RefObject } from 'react'
import type { VideoInfo } from '../../electron/types/video'

interface VideoPreviewProps {
  videoInfo: VideoInfo
  videoRef: RefObject<HTMLVideoElement>
}

export function VideoPreview({ videoInfo, videoRef }: VideoPreviewProps) {
  return (
    <video
      ref={videoRef}
      src={videoInfo.videoUrl}
      controls
      width={400}
      onLoadedMetadata={() => console.log('video carregado')}
      onError={(event) => console.error('erro video', event)}
    />
  )
}
