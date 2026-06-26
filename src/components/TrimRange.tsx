import { useState, type CSSProperties, type RefObject } from 'react'
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
  const selectedDuration = clipEnd - clipStart
  const trackStyle = {
    background: `linear-gradient(
      to right,
      hsl(var(--muted) / 0.46) 0%,
      hsl(var(--muted) / 0.46) ${startPercent}%,
      hsl(var(--primary)) ${startPercent}%,
      #7c3aed ${(startPercent + endPercent) / 2}%,
      #2563eb ${endPercent}%,
      hsl(var(--muted) / 0.46) ${endPercent}%,
      hsl(var(--muted) / 0.46) 100%
    )`,
  } satisfies CSSProperties
  const handleResetTrim = () => {
    setIsResetAnimating(false)
    window.requestAnimationFrame(() => {
      setIsResetAnimating(true)
    })
    onResetTrim()
  }

  return (
    <div className="trim-panel mt-1 rounded-b-md border border-border/80 bg-card/85 px-3 pb-4 pt-3 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)] backdrop-blur sm:px-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <div className="trim-duration-badge">
            <span>Selected</span>
            <strong>{formatDuration(selectedDuration)}</strong>
          </div>

          <div className="grid min-w-[11rem] flex-1 grid-cols-2 gap-2 text-xs sm:flex-none">
            <div className="trim-time-chip">
              <span>Start</span>
              <strong>{formatDuration(clipStart)}</strong>
            </div>
            <div className="trim-time-chip">
              <span>End</span>
              <strong>{formatDuration(clipEnd)}</strong>
            </div>
          </div>
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

          <Tooltip
            content="Export selected range."
            fullWidth={false}
          >
            <span className="inline-flex">
              <Button
                className="h-9"
                disabled={isTrimDisabled || isTrimming}
                onClick={onTrim}
                size="sm"
                type="button"
                variant="secondary"
              >
                {isTrimming ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Scissors />
                )}
                {isTrimming ? 'Exporting...' : 'Trim'}
              </Button>
            </span>
          </Tooltip>
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
            style={{ ...props.style, ...trackStyle }}
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
