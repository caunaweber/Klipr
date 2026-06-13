import { Pause, Play } from 'lucide-react'
import { formatDuration } from '../utils/formatDuration'
import { Tooltip } from './Tooltip'
import { Button } from './ui/button'

interface PlayerControlsProps {
  currentTime: number
  duration: number
  isPlaying: boolean
  onTogglePlayback: () => void
}

export function PlayerControls({
  currentTime,
  duration,
  isPlaying,
  onTogglePlayback,
}: PlayerControlsProps) {
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
    </div>
  )
}
