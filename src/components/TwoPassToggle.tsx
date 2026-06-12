interface TwoPassToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function TwoPassToggle({
  checked,
  onCheckedChange,
}: TwoPassToggleProps) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2.5">
      <span className="text-sm font-medium text-foreground">
        2-pass compression
      </span>
      <input
        className="h-4 w-4 accent-primary"
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
    </label>
  )
}
