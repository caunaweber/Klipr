import { Check } from 'lucide-react'
import { cn } from '../lib/utils'
import { Tooltip } from './Tooltip'

interface TwoPassToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export function TwoPassToggle({
  checked,
  onCheckedChange,
}: TwoPassToggleProps) {
  return (
    <Tooltip content="More accurate size, slower compression.">
      <div
        className={cn(
          'flex w-full cursor-pointer items-center justify-between gap-3 rounded-md border border-border/80 bg-background/70 px-3 py-2.5 transition-colors hover:border-primary/50 hover:bg-accent/30',
          checked && 'border-primary/60 bg-primary/10',
        )}
        onClick={() => onCheckedChange(!checked)}
      >
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-foreground">
            2-pass compression
          </span>
          <span className="text-xs text-muted-foreground">
            More accurate target size
          </span>
        </span>
        <button
          aria-checked={checked}
          aria-label="Toggle 2-pass compression"
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full border border-input bg-muted transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
            checked && 'border-primary bg-primary shadow-glow',
          )}
          onClick={(event) => {
            event.stopPropagation()
            onCheckedChange(!checked)
          }}
          role="switch"
          type="button"
        >
          <span
            className={cn(
              'absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background shadow-sm transition-transform',
              checked && 'translate-x-5 bg-primary-foreground',
            )}
          >
            <Check
              className={cn(
                'h-3 w-3 text-primary transition-opacity',
                checked ? 'opacity-100' : 'opacity-0',
              )}
            />
          </span>
        </button>
      </div>
    </Tooltip>
  )
}
