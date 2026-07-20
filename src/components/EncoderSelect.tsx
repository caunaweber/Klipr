import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import type {
  EncoderCapability,
  EncoderId,
} from '../../electron/types/encoder'
import { cn } from '../lib/utils'
import { Tooltip } from './Tooltip'

interface EncoderSelectProps {
  disabled?: boolean
  encoders: readonly EncoderCapability[]
  isLoading: boolean
  onEncoderChange: (encoderId: EncoderId) => void
  selectedEncoderId: EncoderId
}

export function EncoderSelect({
  disabled = false,
  encoders,
  isLoading,
  onEncoderChange,
  selectedEncoderId,
}: EncoderSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectedEncoder = encoders.find(
    (encoder) => encoder.id === selectedEncoderId,
  ) ?? encoders[0]
  const isDisabled = disabled || isLoading
  const tooltip = isLoading
    ? 'Detecting available FFmpeg encoders'
    : selectedEncoder?.description ?? 'Select an encoder'

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
        Encoder
      </span>
      <Tooltip content={tooltip}>
        <button
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-md border border-input bg-background/70 px-3 text-left text-sm font-medium text-foreground shadow-sm outline-none transition-colors hover:border-primary/60 hover:bg-accent/40 focus:border-ring focus:ring-1 focus:ring-ring/40',
            isOpen && 'border-primary/80 bg-accent/40 ring-1 ring-ring/40',
            isDisabled && 'cursor-not-allowed opacity-60',
          )}
          disabled={isDisabled}
          onClick={(event) => {
            event.preventDefault()
            setIsOpen((current) => !current)
          }}
          onKeyDown={(event) => {
            if (
              (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') ||
              encoders.length === 0
            ) {
              return
            }

            event.preventDefault()
            const currentIndex = encoders.findIndex(
              (encoder) => encoder.id === selectedEncoderId,
            )
            const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0
            const nextIndex = event.key === 'ArrowDown'
              ? (safeCurrentIndex + 1) % encoders.length
              : (safeCurrentIndex - 1 + encoders.length) % encoders.length

            onEncoderChange(encoders[nextIndex].id)
          }}
          role="combobox"
          type="button"
        >
          <span className="min-w-0 truncate">
            {isLoading ? 'Detecting encoders...' : selectedEncoder?.label}
          </span>
          {isLoading ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          ) : (
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                isOpen && 'rotate-180 text-primary',
              )}
            />
          )}
        </button>
      </Tooltip>

      {isOpen && !isDisabled && (
        <div
          className="absolute left-0 right-0 top-full z-40 mt-2 origin-top overflow-hidden rounded-md border border-border/90 bg-card/95 p-1 shadow-soft backdrop-blur animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-150 ease-out motion-reduce:animate-none"
          role="listbox"
        >
          {encoders.map((encoder) => {
            const isSelected = encoder.id === selectedEncoderId

            return (
              <button
                aria-selected={isSelected}
                className={cn(
                  'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left text-sm transition-colors hover:bg-accent/70 hover:text-accent-foreground',
                  isSelected
                    ? 'bg-primary/15 text-foreground'
                    : 'text-muted-foreground',
                )}
                key={encoder.id}
                onClick={(event) => {
                  event.preventDefault()
                  onEncoderChange(encoder.id)
                  setIsOpen(false)
                }}
                role="option"
                type="button"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{encoder.label}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {encoder.description}
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
