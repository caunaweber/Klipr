import { Copy, Minus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import packageJson from '../../package.json'

export function AppTitleBar() {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    let isMounted = true

    void window.windowControls.isMaximized().then((nextIsMaximized) => {
      if (isMounted) {
        setIsMaximized(nextIsMaximized)
      }
    })

    const unsubscribe =
      window.windowControls.onMaximizedChange(setIsMaximized)

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  return (
    <div
      className="app-titlebar flex h-9 select-none items-center justify-between border-b border-border/80 bg-background/90 text-foreground backdrop-blur"
    >
      <div className="flex min-w-0 items-center gap-2 px-3">
        <span className="truncate text-sm font-semibold tracking-wide text-foreground">
          klipr
        </span>
        <button
          aria-label="Open Klipr repository on GitHub"
          className="app-titlebar-button flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          onClick={() => {
            void window.windowControls.openRepository()
          }}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.52 2.87 8.35 6.84 9.7.5.09.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.51.47-3.16-.63-3.36-1.21-.11-.3-.6-1.21-1.03-1.46-.35-.19-.85-.66-.01-.67.79-.01 1.35.74 1.54 1.05.9 1.55 2.34 1.11 2.91.85.09-.67.35-1.11.64-1.37-2.22-.26-4.55-1.14-4.55-5.04 0-1.11.39-2.02 1.03-2.73-.1-.26-.45-1.29.1-2.69 0 0 .84-.27 2.75 1.04A9.3 9.3 0 0 1 12 6.98c.85 0 1.71.12 2.51.34 1.91-1.32 2.75-1.04 2.75-1.04.55 1.4.2 2.43.1 2.69.64.71 1.03 1.61 1.03 2.73 0 3.92-2.34 4.78-4.57 5.04.36.32.68.93.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.15 10.15 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z" />
          </svg>
        </button>
        <span className="rounded border border-border/70 bg-muted/45 px-1.5 py-0.5 text-[0.625rem] font-medium leading-none tracking-wide text-muted-foreground">
          v{packageJson.version}
        </span>
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
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
          className="app-titlebar-button flex h-full w-11 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={() => {
            void window.windowControls.toggleMaximize()
          }}
          type="button"
        >
          {isMaximized ? (
            <Copy className="h-4 w-4" />
          ) : (
            <span
              aria-hidden="true"
              className="h-3 w-3 border border-current"
            />
          )}
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
