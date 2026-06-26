import { useState, type RefObject } from 'react'
import { Loader2, RotateCcw, Scissors } from 'lucide-react'
import { Range } from 'react-range'
import { formatDuration } from '../utils/formatDuration'
import { Tooltip } from './Tooltip'
import { Button } from './ui/button'

interface TrimRangeProps {
  clipEnd: number
  clipStart: number
  duration: number
  isTrimDisabled: boolean
  isTrimming: boolean
  onClipEndChange: (clipEnd: number) => void
  onClipStartChange: (clipStart: number) => void
  onResetTrim: () => void
  onTrim: () => void
  videoRef: RefObject<HTMLVideoElement>
}

export function TrimRange({
  clipEnd,
  clipStart,
  duration,
  isTrimDisabled,
  isTrimming,
  onClipEndChange,
  onClipStartChange,
  onResetTrim,
  onTrim,
  videoRef,
}: TrimRangeProps) {
  const [activeThumb, setActiveThumb] = useState(0)
  const [isResetAnimating, setIsResetAnimating] = useState(false)

  const startPercent = (clipStart / duration) * 100
  const endPercent = (clipEnd / duration) * 100
  const handleResetTrim = () => {
    setIsResetAnimating(false)
    window.requestAnimationFrame(() => {
      setIsResetAnimating(true)
    })
    onResetTrim()
  }

  return (
    <div className="mt-1 rounded-b-md border border-border/70 bg-background/45 px-3 pb-4 pt-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)] backdrop-blur sm:px-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">Trim</h3>
          <p className="mt-0.5 break-words text-xs text-muted-foreground">
            {formatDuration(clipStart)} to {formatDuration(clipEnd)} (
            {formatDuration(clipEnd - clipStart)})
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Tooltip
            content="Restore full video range."
            fullWidth={false}
          >
            <span className="inline-flex">
              <Button
                aria-label="Reset trim"
                className="h-9 px-2.5 text-muted-foreground hover:text-foreground"
                onClick={handleResetTrim}
                size="sm"
                type="button"
                variant="ghost"
              >
                <RotateCcw
                  className={isResetAnimating ? 'trim-reset-spin' : undefined}
                  onAnimationEnd={() => setIsResetAnimating(false)}
                />
                Reset
              </Button>
            </span>
          </Tooltip>

          <Button
            className="h-9"
            disabled={isTrimDisabled || isTrimming}
            onClick={onTrim}
            size="sm"
            type="button"
            variant="secondary"
          >
            {isTrimming ? <Loader2 className="animate-spin" /> : <Scissors />}
            {isTrimming ? 'Exporting...' : 'Trim'}
          </Button>
        </div>
      </div>

      <Range
        step={0.1}
        min={0}
        max={duration}
        values={[clipStart, clipEnd]}
        onChange={(values) => {
          const [start, end] = values

          if (end - start < 1) {
            return
          }

          onClipStartChange(start)
          onClipEndChange(end)

          if (!videoRef.current) {
            return
          }

          videoRef.current.currentTime = activeThumb === 0 ? start : end
        }}
        renderTrack={({ props, children }) => (
          <div
            {...props}
            style={{
              ...props.style,
              background: `linear-gradient(
                to right,
                hsl(var(--muted)) 0%,
                hsl(var(--muted)) ${startPercent}%,
                hsl(var(--primary)) ${startPercent}%,
                hsl(var(--primary)) ${endPercent}%,
                hsl(var(--muted)) ${endPercent}%,
                hsl(var(--muted)) 100%
              )`,
            }}
            className="trim-track"
          >
            {children}
          </div>
        )}
        renderThumb={({ props, index }) => (
          <div
            {...props}
            onMouseDown={() => setActiveThumb(index)}
            className={`trim-thumb group/trim-thumb ${
              index === 0 ? 'trim-thumb-start' : 'trim-thumb-end'
            }`}
          >
            <span className="trim-thumb-tooltip">
              {index === 0 ? 'Start' : 'End'}:{' '}
              {formatDuration(index === 0 ? clipStart : clipEnd)}
            </span>
          </div>
        )}
      />
    </div>
  )
}
