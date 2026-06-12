import { useEffect } from 'react'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'
import { cn } from '../lib/utils'

interface AppToastProps {
  message: string | null
  onClose: () => void
  tone: 'error' | 'info' | 'neutral' | 'success'
}

export function AppToast({ message, onClose, tone }: AppToastProps) {
  const dismissAfterMs = 4000

  useEffect(() => {
    if (!message) return

    const timeoutId = window.setTimeout(onClose, dismissAfterMs)

    return () => window.clearTimeout(timeoutId)
  }, [message, onClose, tone, dismissAfterMs])

  if (!message) return null

  const Icon =
    tone === 'success' || tone === 'neutral'
      ? CheckCircle2
      : tone === 'error'
        ? AlertCircle
        : Loader2
  const title =
    tone === 'success'
      ? 'Done'
      : tone === 'error'
        ? 'Error'
        : tone === 'neutral'
          ? 'Cancelled'
          : 'Working'

  return (
    <div
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm animate-in fade-in-0 slide-in-from-right-4"
      role="status"
    >
      <section
        className={cn(
          'relative overflow-hidden rounded-lg border bg-card/95 p-3 shadow-[0_24px_80px_rgb(0_0_0_/_0.35)] backdrop-blur',
          tone === 'success' && 'border-primary/60 border-l-4',
          tone === 'error' && 'border-destructive/70 border-l-4',
          tone === 'info' && 'border-primary/50 border-l-4',
          tone === 'neutral' && 'border-muted/80 border-l-4',
        )}
      >
        <div className="flex items-start gap-3">
          <Icon
            className={cn(
              'mt-0.5 h-5 w-5 shrink-0',
              tone === 'success' && 'text-primary',
              tone === 'neutral' && 'text-muted-foreground',
              tone === 'error' && 'text-destructive',
              tone === 'info' && 'animate-spin text-primary',
            )}
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="mt-0.5 break-words text-sm leading-6 text-muted-foreground">
              {message}
            </p>
          </div>
          <button
            aria-label="Close message"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-border/70">
          <div
            className={cn(
              'toast-progress h-full',
              tone === 'error' && 'bg-destructive',
              tone === 'success' && 'bg-primary',
              tone === 'info' && 'bg-primary',
              tone === 'neutral' && 'bg-muted-foreground',
            )}
            style={{ animationDuration: `${dismissAfterMs}ms` }}
          />
        </div>
      </section>
    </div>
  )
}
