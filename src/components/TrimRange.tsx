import { useState, type RefObject } from 'react'
import { Range } from 'react-range'
import { formatDuration } from '../utils/formatDuration'

interface TrimRangeProps {
  clipEnd: number
  clipStart: number
  duration: number
  onClipEndChange: (clipEnd: number) => void
  onClipStartChange: (clipStart: number) => void
  videoRef: RefObject<HTMLVideoElement>
}

export function TrimRange({
  clipEnd,
  clipStart,
  duration,
  onClipEndChange,
  onClipStartChange,
  videoRef,
}: TrimRangeProps) {
  const [activeThumb, setActiveThumb] = useState(0)

  const startPercent = (clipStart / duration) * 100
  const endPercent = (clipEnd / duration) * 100

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <div className="mb-5">
        <h3 className="text-base font-semibold">Trim</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDuration(clipStart)} to {formatDuration(clipEnd)} (
          {formatDuration(clipEnd - clipStart)})
        </p>
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
    </section>
  )
}
