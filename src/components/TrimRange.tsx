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
    <section className="section">
      <h3>Trim</h3>

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
                #444 0%,
                #444 ${startPercent}%,
                #4caf50 ${startPercent}%,
                #4caf50 ${endPercent}%,
                #444 ${endPercent}%,
                #444 100%
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

      <p>
        Clip: {formatDuration(clipStart)} to {formatDuration(clipEnd)} (
        {formatDuration(clipEnd - clipStart)})
      </p>
    </section>
  )
}
