import { Clock3, HardDrive, Maximize2 } from 'lucide-react'
import type { VideoInfo } from '../../electron/types/video'
import { formatDuration } from '../utils/formatDuration'

interface VideoDetailsProps {
  videoInfo: VideoInfo
}

export function VideoDetails({ videoInfo }: VideoDetailsProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <h2 className="truncate text-base font-semibold text-foreground">
        {videoInfo.fileName}
      </h2>
      <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <HardDrive className="h-4 w-4 text-primary" />
          <span>{videoInfo.sizeMB} MB</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-primary" />
          <span>{formatDuration(videoInfo.duration)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Maximize2 className="h-4 w-4 text-primary" />
          <span>
            {videoInfo.width} x {videoInfo.height}
          </span>
        </div>
      </div>
    </section>
  )
}
