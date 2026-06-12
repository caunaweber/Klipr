interface TargetSizeInputProps {
  value: string
  onValueChange: (value: string) => void
}

export function TargetSizeInput({
  value,
  onValueChange,
}: TargetSizeInputProps) {
  return (
    <label className="field">
      <span>Target size (MB):</span>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </label>
  )
}
