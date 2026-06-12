import type { RefObject } from 'react'
import { Clock3, HardDrive, Maximize2, Trash2 } from 'lucide-react'
import type { VideoInfo } from '../../electron/types/video'
import { formatDuration } from '../utils/formatDuration'
import { PlayerControls } from './PlayerControls'
import { TrimRange } from './TrimRange'
import { Button } from './ui/button'

interface VideoPreviewProps {
  clipEnd: number
  clipStart: number
  currentTime: number
  duration: number
  isClearDisabled: boolean
  isPlaying: boolean
  onClipEndChange: (clipEnd: number) => void
  onClipStartChange: (clipStart: number) => void
  onClearVideo: () => void
  onResetTrim: () => void
  onTogglePlayback: () => void
  videoInfo: VideoInfo
  videoRef: RefObject<HTMLVideoElement>
}

export function VideoPreview({
  clipEnd,
  clipStart,
  currentTime,
  duration,
  isClearDisabled,
  isPlaying,
  onClipEndChange,
  onClipStartChange,
  onClearVideo,
  onResetTrim,
  onTogglePlayback,
  videoInfo,
  videoRef,
}: VideoPreviewProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card shadow-soft">
      <div className="flex flex-col gap-2 border-b border-border bg-card/95 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-foreground">
            {videoInfo.fileName}
          </h2>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-primary" />
              {videoInfo.sizeMB} MB
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-primary" />
              {formatDuration(videoInfo.duration)}
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5 text-primary" />
              {videoInfo.width} x {videoInfo.height}
            </span>
          </div>
        </div>

        <Button
          aria-label="Remove selected video"
          className="shrink-0 self-end sm:self-center"
          disabled={isClearDisabled}
          onClick={onClearVideo}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 />
        </Button>
      </div>
      <video
        className="aspect-video max-h-[52vh] w-full bg-black object-contain"
        ref={videoRef}
        src={videoInfo.videoUrl}
        onError={(event) => console.error('erro video', event)}
      />
      <PlayerControls
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onTogglePlayback={onTogglePlayback}
      />
      <TrimRange
        clipEnd={clipEnd}
        clipStart={clipStart}
        duration={videoInfo.duration}
        onClipEndChange={onClipEndChange}
        onClipStartChange={onClipStartChange}
        onResetTrim={onResetTrim}
        videoRef={videoRef}
      />
    </section>
  )
}
