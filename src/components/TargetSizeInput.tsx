interface TargetSizeInputProps {
  value: string
  onValueChange: (value: string) => void
}

export function TargetSizeInput({
  value,
  onValueChange,
}: TargetSizeInputProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">
        Target size (MB)
      </span>
      <input
        className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
        type="number"
        min={1}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </label>
  )
}
