interface TargetSizeInputProps {
  value: string
  onValueChange: (value: string) => void
}

const TARGET_SIZE_PRESETS = ['8', '10', '25', '50', '100']

export function TargetSizeInput({
  value,
  onValueChange,
}: TargetSizeInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground" htmlFor="target-size">
        Target size (MB)
      </label>
      <div className="grid grid-cols-5 gap-2">
        {TARGET_SIZE_PRESETS.map((preset) => (
          <button
            className={`h-9 rounded-md border px-2 text-sm font-medium transition-colors ${
              value === preset
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
            key={preset}
            onClick={() => onValueChange(preset)}
            type="button"
          >
            {preset}
          </button>
        ))}
      </div>
      <input
        id="target-size"
        className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        type="number"
        min={1}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </div>
  )
}
