import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import type { CompressionCodec } from '../../electron/types/compression'
import { cn } from '../lib/utils'
import { Tooltip } from './Tooltip'

interface CodecSelectProps {
  codec: CompressionCodec
  onCodecChange: (codec: CompressionCodec) => void
}

const CODEC_OPTIONS: Array<{
  description: string
  label: string
  value: CompressionCodec
}> = [
  {
    description: 'Faster, broadly compatible',
    label: 'AVC (H.264)',
    value: 'h264',
  },
  {
    description: 'Smaller files, slower encode',
    label: 'HEVC (H.265)',
    value: 'h265',
  },
]

export function CodecSelect({ codec, onCodecChange }: CodecSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectedCodec = CODEC_OPTIONS.find((option) => option.value === codec)
  const tooltip =
    codec === 'h265'
      ? 'Slower but better quality'
      : 'Faster, lower quality and lower precision'

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
    <div className="relative flex flex-col gap-2" ref={rootRef}>
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Codec
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
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              const currentIndex = CODEC_OPTIONS.findIndex(
                (option) => option.value === codec,
              )
              const nextIndex =
                event.key === 'ArrowDown'
                  ? (currentIndex + 1) % CODEC_OPTIONS.length
                  : (currentIndex - 1 + CODEC_OPTIONS.length) %
                    CODEC_OPTIONS.length

              onCodecChange(CODEC_OPTIONS[nextIndex].value)
            }
          }}
          role="combobox"
          value={codec}
          type="button"
        >
          <span className="min-w-0 truncate">{selectedCodec?.label}</span>
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
          className="absolute left-0 right-0 top-full z-40 mt-2 origin-top overflow-hidden rounded-md border border-border/90 bg-card/95 p-1 shadow-soft backdrop-blur animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150 ease-out motion-reduce:animate-none"
          role="listbox"
        >
          {CODEC_OPTIONS.map((option) => {
            const isSelected = option.value === codec

            return (
              <button
                aria-selected={isSelected}
                className={cn(
                  'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-accent/70 hover:text-accent-foreground',
                  isSelected
                    ? 'bg-primary/15 text-foreground'
                    : 'text-muted-foreground',
                )}
                key={option.value}
                onClick={(event) => {
                  event.preventDefault()
                  onCodecChange(option.value)
                  setIsOpen(false)
                }}
                role="option"
                type="button"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{option.label}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </span>
                <Check
                  className={cn(
                    'h-4 w-4 shrink-0 text-primary',
                    !isSelected && 'opacity-0',
                  )}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
