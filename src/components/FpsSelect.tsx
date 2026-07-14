import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { CompressionFps } from '../../electron/types/compression'
import { cn } from '../lib/utils'
import { Tooltip } from './Tooltip'

interface FpsSelectProps {
  fps: CompressionFps
  sourceFps: number
  onFpsChange: (fps: CompressionFps) => void
}

const FPS_OPTIONS: Array<{
  label: string
  value: CompressionFps
}> = [
  {
    label: 'Native',
    value: 'native',
  },
  {
    label: '30 FPS',
    value: 30,
  },
  {
    label: '60 FPS',
    value: 60,
  },
  {
    label: '120 FPS',
    value: 120,
  },
]

function getOptionIsDisabled(
  value: CompressionFps,
  sourceFps: number
) {
  return (
    value !== 'native' &&
    (!Number.isFinite(sourceFps) || sourceFps <= 0 || value > sourceFps)
  )
}

export function FpsSelect({
  fps,
  sourceFps,
  onFpsChange,
}: FpsSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectedFps =
    FPS_OPTIONS.find((option) => option.value === fps) ?? FPS_OPTIONS[0]
  const tooltip =
    fps === 'native'
      ? 'Keeps the original frame rate'
      : `Exports at ${fps} FPS`

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="relative flex min-w-0 flex-col gap-2" ref={rootRef}>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        FPS
      </span>
      <Tooltip content={tooltip}>
        <button
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-md border border-input bg-background/70 px-3 text-left text-sm font-medium text-foreground shadow-sm outline-none transition-colors hover:border-primary/60 hover:bg-accent/40 focus:border-ring focus:ring-1 focus:ring-ring/40',
            isOpen && 'border-primary/80 bg-accent/40 ring-1 ring-ring/40',
          )}
          onClick={(event) => {
            event.preventDefault()
            setIsOpen((current) => !current)
          }}
          role="combobox"
          type="button"
        >
          <span className="min-w-0 truncate">{selectedFps.label}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
              isOpen && 'rotate-180 text-primary',
            )}
          />
        </button>
      </Tooltip>

      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-md border border-border/90 bg-card/95 p-1 shadow-soft backdrop-blur"
          role="listbox"
        >
          {FPS_OPTIONS.map((option) => {
            const isSelected = option.value === fps
            const isDisabled = getOptionIsDisabled(option.value, sourceFps)
            const optionButton = (
              <button
                aria-disabled={isDisabled}
                aria-selected={isSelected}
                className={cn(
                  'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors',
                  isSelected
                    ? 'bg-primary/15 text-foreground'
                    : 'text-muted-foreground',
                  isDisabled
                    ? 'cursor-not-allowed opacity-45'
                    : 'hover:bg-accent/70 hover:text-accent-foreground',
                )}
                key={option.value}
                onClick={(event) => {
                  event.preventDefault()

                  if (isDisabled) {
                    return
                  }

                  onFpsChange(option.value)
                  setIsOpen(false)
                }}
                role="option"
                type="button"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{option.label}</span>
                </span>
                <Check
                  className={cn(
                    'h-4 w-4 shrink-0 text-primary',
                    !isSelected && 'opacity-0',
                  )}
                />
              </button>
            )

            return isDisabled ? (
              <Tooltip
                content="Cannot export above the source FPS."
                key={option.value}
                tone="error"
              >
                {optionButton}
              </Tooltip>
            ) : (
              optionButton
            )
          })}
        </div>
      )}
    </div>
  )
}
