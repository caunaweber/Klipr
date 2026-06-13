import { useState, type DragEvent, type KeyboardEvent } from 'react'
import { AlertCircle, Loader2, UploadCloud } from 'lucide-react'
import { cn } from '../lib/utils'

interface VideoDropzoneProps {
  error?: string | null
  isLoading: boolean
  onDropVideo: (file: File) => void
  onSelectVideo: () => void
}

export function VideoDropzone({
  error,
  isLoading,
  onDropVideo,
  onSelectVideo,
}: VideoDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (isLoading) return
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (isLoading) return

    const file = event.dataTransfer.files.item(0)

    if (file) {
      onDropVideo(file)
    }
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (isLoading) return
      onSelectVideo()
    }
  }

  return (
    <div
      className={cn(
        'group flex min-h-[360px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-border/90 bg-card/70 p-6 text-center shadow-soft outline-none backdrop-blur transition-all hover:border-primary/70 hover:bg-card/90 hover:shadow-glow focus-visible:ring-2 focus-visible:ring-ring sm:p-8',
        isDragging && 'border-primary bg-primary/10 shadow-glow',
        isLoading ? 'cursor-wait border-primary/60 bg-card/90' : 'cursor-pointer',
        error && 'border-destructive/70',
      )}
      onClick={() => {
        if (!isLoading) {
          onSelectVideo()
        }
      }}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <div
        className={cn(
          'mb-4 rounded-full border border-border/80 bg-accent/80 p-3 text-accent-foreground shadow-glow transition-transform group-hover:scale-105',
          isDragging && 'scale-105 border-primary bg-primary text-primary-foreground',
        )}
      >
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <UploadCloud className="h-6 w-6" />
        )}
      </div>

      <h2 className="max-w-full text-lg font-semibold">
        {isLoading ? 'Loading video...' : 'Select a video'}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Drag a video here or click to choose a local file.
      </p>

      {error && (
        <div className="mt-5 flex max-w-sm items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-left text-sm text-destructive-foreground">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="min-w-0 break-words">{error}</span>
        </div>
      )}
    </div>
  )
}
