import { Minus, X } from 'lucide-react'

export function AppTitleBar() {
  return (
    <div
      className="app-titlebar flex h-9 select-none items-center justify-between border-b border-border bg-background/95 text-foreground"
    >
      <div className="flex min-w-0 items-center gap-2 px-3">
        <span className="truncate text-sm font-semibold">klipr</span>
      </div>

      <div className="app-titlebar-controls flex h-full shrink-0">
        <button
          aria-label="Minimize"
          className="app-titlebar-button flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={() => {
            void window.windowControls.minimize()
          }}
          type="button"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          aria-label="Close"
          className="app-titlebar-button flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => {
            void window.windowControls.close()
          }}
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
