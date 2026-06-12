interface TwoPassToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function TwoPassToggle({
  checked,
  onCheckedChange,
}: TwoPassToggleProps) {
  return (
    <label className="checkbox-field">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      2-pass compression
    </label>
  )
}
