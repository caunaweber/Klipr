import { cn } from '../lib/utils'

type ExportProgressOperation =
  | 'compression'
  | 'trim'

interface ExportProgressProps {
  isComplete?: boolean
  operation: ExportProgressOperation
  progress: number
}

export function ExportProgress({
  isComplete = false,
  operation,
  progress,
}: ExportProgressProps) {
  const normalizedProgress = Math.min(
    100,
    Math.max(0, Math.round(progress)),
  )
  const activeLabel = operation === 'trim'
    ? 'Exporting'
    : 'Compressing'
  const progressLabel =
    isComplete
      ? 'Complete'
      : normalizedProgress >= 100
      ? 'Finalizing'
      : normalizedProgress > 0
        ? activeLabel
        : 'Ready'
  const isActive = normalizedProgress > 0 && normalizedProgress < 100

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border/70 bg-background/45 p-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-foreground">{progressLabel}</span>
        <span className="rounded-full border border-border/80 bg-card/80 px-2 py-0.5 font-medium tabular-nums text-muted-foreground">
          {normalizedProgress}%
        </span>
      </div>
      <div
        aria-label="Export progress"
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={normalizedProgress}
        className="relative h-2.5 overflow-hidden rounded-full border border-border/70 bg-muted/70"
        role="progressbar"
      >
        <div
          className={cn(
            'relative h-full overflow-hidden rounded-full bg-[linear-gradient(90deg,hsl(var(--primary))_0%,#7c3aed_55%,#2563eb_100%)] shadow-[0_0_18px_rgb(124_58_237_/_0.45)] transition-[width] duration-300 ease-out',
            isActive && 'progress-shimmer',
          )}
          style={{ width: `${normalizedProgress}%` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgb(255_255_255_/_0.18),transparent_55%)]" />
      </div>
    </div>
  )
}
