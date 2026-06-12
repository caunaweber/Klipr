import { useState, type RefObject } from 'react'
import { RotateCcw } from 'lucide-react'
import { Range } from 'react-range'
import { formatDuration } from '../utils/formatDuration'
import { Button } from './ui/button'

interface TrimRangeProps {
  clipEnd: number
  clipStart: number
  duration: number
  onClipEndChange: (clipEnd: number) => void
  onClipStartChange: (clipStart: number) => void
  onResetTrim: () => void
  videoRef: RefObject<HTMLVideoElement>
}

export function TrimRange({
  clipEnd,
  clipStart,
  duration,
  onClipEndChange,
  onClipStartChange,
  onResetTrim,
  videoRef,
}: TrimRangeProps) {
  const [activeThumb, setActiveThumb] = useState(0)

  const startPercent = (clipStart / duration) * 100
  const endPercent = (clipEnd / duration) * 100

  return (
    <div className="border-t border-border bg-card/95 px-3 pb-4 pt-3 sm:px-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">Trim</h3>
          <p className="mt-0.5 break-words text-xs text-muted-foreground">
            {formatDuration(clipStart)} to {formatDuration(clipEnd)} (
            {formatDuration(clipEnd - clipStart)})
          </p>
        </div>

        <Button
          aria-label="Reset trim"
          className="shrink-0"
          onClick={onResetTrim}
          size="sm"
          type="button"
          variant="outline"
        >
          <RotateCcw />
          Reset
        </Button>
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
            className="trim-thumb"
          />
        )}
      />
    </div>
  )
}
