import { Pause, Play, Volume1, Volume2, VolumeX } from 'lucide-react'
import type { MouseEvent, PointerEvent } from 'react'
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
  const releasePointerFocus = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType) {
      event.currentTarget.blur()
    }
  }
  const keepPointerFromFocusing = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType) {
      event.preventDefault()
    }
  }
  const releaseFocusInside = (event: MouseEvent<HTMLElement>) => {
    const activeElement = document.activeElement

    if (
      activeElement instanceof HTMLElement &&
      event.currentTarget.contains(activeElement)
    ) {
      activeElement.blur()
    }
  }

  return (
    <div className="pointer-events-auto flex items-end justify-between gap-2">
      <div
        className="flex h-11 items-center gap-2 rounded-md border border-white/[0.06] bg-black/[0.16] px-2 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)] transition-all duration-200 hover:border-white/[0.14] hover:bg-black/[0.34] hover:backdrop-blur-sm"
        onClick={(event) => event.stopPropagation()}
      >
      <Tooltip
        content={isPlaying ? 'Pause preview.' : 'Play preview.'}
        fullWidth={false}
      >
        <span className="inline-flex">
          <Button
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            className="h-8 w-8 border border-white/[0.07] bg-black/[0.18] text-white shadow-[0_8px_22px_rgb(0_0_0_/_0.18)] transition-all duration-200 hover:scale-105 hover:border-primary/45 hover:bg-primary hover:text-primary-foreground focus-visible:scale-105 focus-visible:border-primary/55"
            onClick={onTogglePlayback}
            onPointerDown={keepPointerFromFocusing}
            onPointerUp={releasePointerFocus}
            size="icon"
            type="button"
            variant="ghost"
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
        </span>
      </Tooltip>

      <div className="min-w-0 rounded-md border border-white/[0.06] bg-black/[0.16] px-2 py-0.5 text-xs font-medium tabular-nums text-white shadow-[inset_0_1px_0_rgb(255_255_255_/_0.03)]">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </div>
      </div>

      <div
        className="group/volume relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-black/[0.16] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)] transition-all duration-200 hover:border-white/[0.14] hover:bg-black/[0.34] hover:backdrop-blur-sm"
        onClick={(event) => event.stopPropagation()}
        onMouseLeave={releaseFocusInside}
      >
        <div className="absolute bottom-full left-0 h-2 w-full" />
        <div className="pointer-events-none absolute bottom-[calc(100%+0.375rem)] left-1/2 z-30 flex h-32 w-10 -translate-x-1/2 translate-y-1 items-center justify-center rounded-md border border-white/[0.12] bg-black/[0.5] px-1.5 py-3 opacity-0 shadow-[0_18px_60px_rgb(0_0_0_/_0.48)] backdrop-blur-md transition-all duration-150 group-hover/volume:pointer-events-auto group-hover/volume:translate-y-0 group-hover/volume:opacity-100">
          <input
            aria-label="Preview volume"
            className="preview-volume-slider preview-volume-slider-vertical"
            max="100"
            min="0"
            onChange={(event) => onChangeVolume(Number(event.target.value) / 100)}
            type="range"
            value={Math.round(audibleVolume * 100)}
          />
          <span className="absolute -top-7 left-1/2 w-10 -translate-x-1/2 rounded-md border border-white/10 bg-black/[0.88] px-1.5 py-0.5 text-center text-xs font-medium tabular-nums text-white/[0.78] shadow-[0_10px_30px_rgb(0_0_0_/_0.34)]">
            {Math.round(audibleVolume * 100)}%
          </span>
        </div>

        <button
          aria-label={isMuted ? 'Restore preview audio' : 'Mute preview audio'}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/0 text-white/70 transition-all duration-200 hover:scale-105 hover:border-primary/35 hover:bg-white/10 hover:text-white focus-visible:scale-105 focus-visible:border-primary/45 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/70"
          onClick={onToggleMute}
          onPointerDown={keepPointerFromFocusing}
          onPointerUp={releasePointerFocus}
          type="button"
        >
          <VolumeIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
