import type { RefObject } from 'react'
import type { VideoInfo } from '../../electron/types/video'

interface VideoPreviewProps {
  videoInfo: VideoInfo
  videoRef: RefObject<HTMLVideoElement>
}

export function VideoPreview({ videoInfo, videoRef }: VideoPreviewProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
      <video
        className="aspect-video w-full bg-black object-contain"
        ref={videoRef}
        src={videoInfo.videoUrl}
        controls
        onLoadedMetadata={() => console.log('video carregado')}
        onError={(event) => console.error('erro video', event)}
      />
    </section>
  )
}
