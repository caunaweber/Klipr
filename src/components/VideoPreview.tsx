import type { RefObject } from 'react'
import { Gauge, HardDrive, Maximize2, Trash2 } from 'lucide-react'
import type { VideoInfo } from '../../electron/types/video'
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
  isTrimDisabled: boolean
  isTrimming: boolean
  onChangeVolume: (volume: number) => void
  onClipEndChange: (clipEnd: number) => void
  onClipStartChange: (clipStart: number) => void
  onClearVideo: () => void
  onPreviewError: () => void
  onResetTrim: () => void
  onTrim: () => void
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
  isTrimDisabled,
  isTrimming,
  onChangeVolume,
  onClipEndChange,
  onClipStartChange,
  onClearVideo,
  onPreviewError,
  onResetTrim,
  onTrim,
  onToggleMute,
  onTogglePlayback,
  videoInfo,
  videoRef,
  volume,
}: VideoPreviewProps) {
  return (
    <section className="video-preview-shell relative z-10 flex min-h-[32rem] flex-col overflow-hidden rounded-lg border border-border/80 bg-card/85 p-1 shadow-[0_24px_80px_rgb(0_0_0_/_0.42)] backdrop-blur transition-all duration-300 hover:border-primary/25 hover:shadow-[0_28px_90px_rgb(0_0_0_/_0.5),0_0_34px_rgb(124_58_237_/_0.08)] lg:min-h-0 lg:flex-1">
      <div className="relative z-10 flex flex-col gap-1.5 rounded-t-md px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
          <h2 className="min-w-0 flex-1 truncate text-sm font-semibold leading-5 text-foreground">
            {videoInfo.fileName}
          </h2>
          <div className="flex shrink-0 flex-wrap gap-1 text-xs text-muted-foreground">
            <span className="inline-flex h-5 items-center gap-1 rounded border border-border/60 bg-background/25 px-1.5">
              <HardDrive className="h-3 w-3 text-primary/90" />
              {videoInfo.sizeMB} MB
            </span>
            <span className="inline-flex h-5 items-center gap-1 rounded border border-border/60 bg-background/25 px-1.5">
              <Gauge className="h-3 w-3 text-primary/90" />
              {Number.isInteger(videoInfo.fps)
                ? videoInfo.fps
                : videoInfo.fps.toFixed(2)}{' '}
              FPS
            </span>
            <span className="inline-flex h-5 items-center gap-1 rounded border border-border/60 bg-background/25 px-1.5">
              <Maximize2 className="h-3 w-3 text-primary/90" />
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
              className="h-8 w-8 text-muted-foreground hover:bg-red-500/10 hover:text-red-200"
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
      <div
        className="video-frame group/video relative my-1 aspect-video min-h-[18rem] overflow-hidden rounded-md border border-border/70 bg-black shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.04),inset_0_0_0_2px_rgb(0_0_0_/_0.58),0_18px_48px_rgb(0_0_0_/_0.28)] lg:min-h-0 lg:flex-1"
        onClick={onTogglePlayback}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-[linear-gradient(180deg,rgb(255_255_255_/_0.055),transparent)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-[linear-gradient(0deg,rgb(0_0_0_/_0.42),transparent)]" />
        <div className="pointer-events-none absolute inset-0 z-10 rounded-md ring-1 ring-inset ring-white/[0.06]" />
        <video
          className="h-full w-full rounded-[calc(0.375rem-1px)] bg-black object-contain"
          preload="auto"
          ref={videoRef}
          src={videoInfo.videoUrl}
          onError={onPreviewError}
        />
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 opacity-100 sm:inset-x-4 sm:bottom-4">
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
        </div>
      </div>
      <TrimRange
        clipEnd={clipEnd}
        clipStart={clipStart}
        currentTime={currentTime}
        duration={videoInfo.duration}
        onClipEndChange={onClipEndChange}
        onClipStartChange={onClipStartChange}
        onResetTrim={onResetTrim}
        onTrim={onTrim}
        isTrimDisabled={isTrimDisabled}
        isTrimming={isTrimming}
        videoRef={videoRef}
      />
    </section>
  )
}
