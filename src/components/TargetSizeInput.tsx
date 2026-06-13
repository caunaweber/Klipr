import { Minus, Plus } from 'lucide-react'
import { cn } from '../lib/utils'
import { Tooltip } from './Tooltip'

interface TargetSizeInputProps {
  sourceSizeMB?: number
  value: string
  onValueChange: (value: string) => void
}

const TARGET_SIZE_PRESETS = ['8', '10', '25', '50', '100']
const INVALID_TARGET_SIZE_MESSAGE = 'Target size must be smaller than the original video.'

export function TargetSizeInput({
  sourceSizeMB,
  value,
  onValueChange,
}: TargetSizeInputProps) {
  const numericValue = Number(value)
  const hasSourceSize = Number.isFinite(sourceSizeMB)
  const isInvalid =
    !Number.isFinite(numericValue) ||
    numericValue <= 0 ||
    (hasSourceSize && numericValue >= Number(sourceSizeMB))

  const getPresetIsInvalid = (preset: string) => {
    const numericPreset = Number(preset)

    return numericPreset <= 0 ||
      (hasSourceSize && numericPreset >= Number(sourceSizeMB))
  }
  const stepTargetSize = (direction: -1 | 1) => {
    const currentValue = Number(value)
    const nextValue = Number.isFinite(currentValue)
      ? Math.max(1, currentValue + direction)
      : 1

    onValueChange(String(nextValue))
  }
  const inputClassName = cn(
    'h-10 w-full rounded-md border border-input bg-background/70 px-3 pr-20 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20',
    isInvalid && 'border-destructive focus:border-destructive focus:ring-destructive/20',
  )
  const input = (
    <div className="relative">
      <input
        id="target-size"
        className={inputClassName}
        inputMode="decimal"
        type="text"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
      <div className="absolute right-1.5 top-1/2 flex -translate-y-1/2 overflow-hidden rounded-md border border-border/80 bg-card/80">
        <button
          aria-label="Decrease target size"
          className="flex h-7 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => stepTargetSize(-1)}
          type="button"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <div className="w-px bg-border/80" />
        <button
          aria-label="Increase target size"
          className="flex h-7 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => stepTargetSize(1)}
          type="button"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-2">
      <label
        className="text-sm font-medium text-foreground"
        htmlFor="target-size"
      >
        Target size (MB)
      </label>
      <div className="grid grid-cols-5 gap-2">
        {TARGET_SIZE_PRESETS.map((preset) => {
          const isSelected = value === preset
          const isPresetInvalid = getPresetIsInvalid(preset)
          const button = (
            <button
              className={cn(
                'h-9 w-full rounded-md border px-2 text-sm font-medium transition-colors',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-glow'
                  : 'border-input bg-background/70 text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground',
                isPresetInvalid &&
                  'border-destructive/70 text-destructive-foreground',
              )}
              onClick={() => onValueChange(preset)}
              type="button"
            >
              {preset}
            </button>
          )

          return isPresetInvalid ? (
            <Tooltip
              content={INVALID_TARGET_SIZE_MESSAGE}
              key={preset}
              tone="error"
            >
              {button}
            </Tooltip>
          ) : (
            <span className="inline-flex w-full" key={preset}>
              {button}
            </span>
          )
        })}
      </div>
      {isInvalid ? (
        <Tooltip content={INVALID_TARGET_SIZE_MESSAGE} tone="error">
          {input}
        </Tooltip>
      ) : (
        input
      )}
    </div>
  )
}
