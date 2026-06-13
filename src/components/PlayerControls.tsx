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
    <div className="flex flex-wrap items-center gap-3 border-t border-border/80 bg-card/55 px-3 py-2.5 backdrop-blur sm:px-4">
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

      <div className="min-w-0 text-sm font-medium tabular-nums text-foreground">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </div>
    </div>
  )
}
