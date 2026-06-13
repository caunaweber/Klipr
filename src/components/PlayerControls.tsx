import { Pause, Play, Volume1, Volume2, VolumeX } from 'lucide-react'
import { formatDuration } from '../utils/formatDuration'
import { Tooltip } from './Tooltip'
import { Button } from './ui/button'

interface PlayerControlsProps {
  currentTime: number
  duration: number
  isMuted: boolean
  isPlaying: boolean
  onChangeVolume: (volume: number) => void
  onToggleMute: () => void
  onTogglePlayback: () => void
  volume: number
}

export function PlayerControls({
  currentTime,
  duration,
  isMuted,
  isPlaying,
  onChangeVolume,
  onToggleMute,
  onTogglePlayback,
  volume,
}: PlayerControlsProps) {
  const audibleVolume = isMuted ? 0 : volume
  const VolumeIcon = audibleVolume === 0 ? VolumeX : audibleVolume < 0.5 ? Volume1 : Volume2

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border/70 bg-background/45 px-3 py-2.5 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)] backdrop-blur sm:px-4">
      <Tooltip
        content={isPlaying ? 'Pause preview.' : 'Play preview.'}
        fullWidth={false}
      >
        <span className="inline-flex">
          <Button
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            onClick={onTogglePlayback}
            size="icon"
            type="button"
            variant="secondary"
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
        </span>
      </Tooltip>

      <div className="min-w-0 rounded-md border border-border/60 bg-card/50 px-2.5 py-1 text-sm font-medium tabular-nums text-foreground">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </div>

      <div className="group/volume relative ml-auto flex h-10 w-10 shrink-0 items-center justify-center">
        <div className="pointer-events-none absolute bottom-[calc(100%-0.125rem)] left-1/2 z-30 flex h-32 w-11 -translate-x-1/2 translate-y-1 items-center justify-center rounded-md border border-border/70 bg-card/95 px-1.5 py-3 opacity-0 shadow-[0_18px_60px_rgb(0_0_0_/_0.42)] backdrop-blur transition-all duration-150 group-hover/volume:pointer-events-auto group-hover/volume:translate-y-0 group-hover/volume:opacity-100 group-focus-within/volume:pointer-events-auto group-focus-within/volume:translate-y-0 group-focus-within/volume:opacity-100">
          <input
            aria-label="Preview volume"
            className="preview-volume-slider preview-volume-slider-vertical"
            max="100"
            min="0"
            onChange={(event) => onChangeVolume(Number(event.target.value) / 100)}
            type="range"
            value={Math.round(audibleVolume * 100)}
          />
          <span className="absolute -top-7 left-1/2 w-10 -translate-x-1/2 rounded-md border border-border/60 bg-background/95 px-1.5 py-0.5 text-center text-xs font-medium tabular-nums text-muted-foreground shadow-[0_10px_30px_rgb(0_0_0_/_0.28)]">
            {Math.round(audibleVolume * 100)}%
          </span>
        </div>

        <button
          aria-label={isMuted ? 'Restore preview audio' : 'Mute preview audio'}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/70"
          onClick={onToggleMute}
          type="button"
        >
          <VolumeIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
