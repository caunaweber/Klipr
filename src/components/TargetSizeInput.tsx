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
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground',
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
          <input
            id="target-size"
            className={cn(
              'h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20',
              'border-destructive focus:border-destructive focus:ring-destructive/20',
            )}
            type="number"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
          />
        </Tooltip>
      ) : (
        <input
          id="target-size"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          type="number"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
      )}
    </div>
  )
}
