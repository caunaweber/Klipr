import type { RefObject } from 'react'
import { Clock3, HardDrive, Maximize2, Trash2 } from 'lucide-react'
import type { VideoInfo } from '../../electron/types/video'
import { formatDuration } from '../utils/formatDuration'
import { PlayerControls } from './PlayerControls'
import { Tooltip } from './Tooltip'
import { TrimRange } from './TrimRange'
import { Button } from './ui/button'

interface VideoPreviewProps {
  clipEnd: number
  clipStart: number
  currentTime: number
  duration: number
  isMuted: boolean
  isClearDisabled: boolean
  isPlaying: boolean
  onChangeVolume: (volume: number) => void
  onClipEndChange: (clipEnd: number) => void
  onClipStartChange: (clipStart: number) => void
  onClearVideo: () => void
  onPreviewError: () => void
  onResetTrim: () => void
  onToggleMute: () => void
  onTogglePlayback: () => void
  videoInfo: VideoInfo
  videoRef: RefObject<HTMLVideoElement>
  volume: number
}

export function VideoPreview({
  clipEnd,
  clipStart,
  currentTime,
  duration,
  isMuted,
  isClearDisabled,
  isPlaying,
  onChangeVolume,
  onClipEndChange,
  onClipStartChange,
  onClearVideo,
  onPreviewError,
  onResetTrim,
  onToggleMute,
  onTogglePlayback,
  videoInfo,
  videoRef,
  volume,
}: VideoPreviewProps) {
  return (
    <section className="video-preview-shell relative z-10 flex min-h-[32rem] flex-col overflow-hidden rounded-lg border border-border/80 bg-[linear-gradient(180deg,hsl(var(--card))_0%,rgb(3_2_7_/_0.94)_100%)] p-1 shadow-[0_28px_90px_rgb(0_0_0_/_0.48)] backdrop-blur transition-all duration-300 hover:border-primary/35 hover:shadow-[0_32px_100px_rgb(0_0_0_/_0.56),0_0_42px_rgb(124_58_237_/_0.12)] lg:min-h-0 lg:flex-1">
      <div className="relative z-10 flex flex-col gap-2 rounded-t-md border border-border/70 bg-background/50 px-3 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-4">
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

        <Tooltip
          className="shrink-0 self-end sm:self-center"
          content="Remove selected video."
          fullWidth={false}
        >
          <span className="inline-flex">
            <Button
              aria-label="Remove selected video"
              disabled={isClearDisabled}
              onClick={onClearVideo}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 />
            </Button>
          </span>
        </Tooltip>
      </div>
      <div className="relative my-1 min-h-0 flex-1 overflow-hidden rounded-md border border-primary/15 bg-black shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.05),inset_0_0_0_2px_rgb(0_0_0_/_0.68),inset_0_22px_70px_rgb(0_0_0_/_0.46),0_0_34px_rgb(79_70_229_/_0.12)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-[linear-gradient(180deg,rgb(255_255_255_/_0.08),transparent)]" />
        <div className="pointer-events-none absolute inset-0 z-10 rounded-md ring-1 ring-inset ring-primary/15" />
        <video
          className="h-full w-full rounded-[calc(0.375rem-1px)] bg-black object-contain"
          preload="auto"
          ref={videoRef}
          src={videoInfo.videoUrl}
          onError={onPreviewError}
        />
      </div>
      <PlayerControls
        currentTime={currentTime}
        duration={duration}
        isMuted={isMuted}
        isPlaying={isPlaying}
        onChangeVolume={onChangeVolume}
        onToggleMute={onToggleMute}
        onTogglePlayback={onTogglePlayback}
        volume={volume}
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
