import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

interface TooltipProps {
  children: ReactNode
  className?: string
  content: ReactNode
  fullWidth?: boolean
  tone?: 'default' | 'error'
}

export function Tooltip({
  children,
  className,
  content,
  fullWidth = true,
  tone = 'default',
}: TooltipProps) {
  return (
    <span
      className={cn(
        'group/tooltip relative inline-flex min-w-0',
        fullWidth && 'w-full',
        className,
      )}
    >
      {children}
      <span
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-56 -translate-x-1/2 rounded-md border px-2.5 py-1.5 text-xs font-medium leading-5 opacity-0 shadow-soft transition-opacity group-hover/tooltip:opacity-100',
          tone === 'error'
            ? 'border-destructive/60 bg-destructive text-destructive-foreground'
            : 'border-border bg-secondary text-secondary-foreground',
        )}
        role="tooltip"
      >
        {content}
      </span>
    </span>
  )
}
