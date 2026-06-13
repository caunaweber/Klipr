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
      className="toast-enter fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm"
      role="status"
    >
      <section
        className={cn(
          'relative overflow-hidden rounded-lg border p-3 shadow-[0_24px_80px_rgb(0_0_0_/_0.42)] backdrop-blur',
          tone === 'success' &&
            'border-emerald-500/35 bg-[linear-gradient(135deg,rgb(6_78_59_/_0.28),hsl(var(--card))_55%)]',
          tone === 'error' &&
            'border-red-500/40 bg-[linear-gradient(135deg,rgb(127_29_29_/_0.34),hsl(var(--card))_55%)]',
          tone === 'info' &&
            'border-primary/45 bg-[linear-gradient(135deg,rgb(79_70_229_/_0.26),hsl(var(--card))_55%)]',
          tone === 'neutral' &&
            'border-border/90 bg-[linear-gradient(135deg,rgb(55_65_81_/_0.2),hsl(var(--card))_55%)]',
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border',
              tone === 'success' &&
                'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
              tone === 'neutral' &&
                'border-border bg-muted/30 text-muted-foreground',
              tone === 'error' &&
                'border-red-400/30 bg-red-500/10 text-red-300',
              tone === 'info' &&
                'border-primary/30 bg-primary/10 text-primary',
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4',
                tone === 'info' && 'animate-spin',
              )}
            />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <p className="mt-0.5 break-words text-sm leading-6 text-muted-foreground">
              {message}
            </p>
          </div>
          <button
            aria-label="Close message"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent/70 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
              tone === 'error' &&
                'bg-[linear-gradient(90deg,#ef4444,#991b1b)]',
              tone === 'success' &&
                'bg-[linear-gradient(90deg,#34d399,#059669)]',
              tone === 'info' &&
                'bg-[linear-gradient(90deg,hsl(var(--primary)),#2563eb)]',
              tone === 'neutral' && 'bg-muted-foreground',
            )}
            style={{ animationDuration: `${dismissAfterMs}ms` }}
          />
        </div>
      </section>
    </div>
  )
}
