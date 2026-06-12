import type { VideoInfo } from '../../electron/types/video'
import { formatDuration } from '../utils/formatDuration'

interface VideoDetailsProps {
  videoInfo: VideoInfo
}

export function VideoDetails({ videoInfo }: VideoDetailsProps) {
  return (
    <section className="section">
      <h2>{videoInfo.fileName}</h2>
      <p>Size: {videoInfo.sizeMB} MB</p>
      <p>Duration: {formatDuration(videoInfo.duration)}</p>
      <p>
        Resolution: {videoInfo.width} x {videoInfo.height}
      </p>
    </section>
  )
}
