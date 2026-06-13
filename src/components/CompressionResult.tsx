import { CheckCircle2, FolderOpen } from 'lucide-react'
import { Button } from './ui/button'

interface CompressionResultProps {
  onOpenFolder: () => void
}

export function CompressionResult({
  onOpenFolder,
}: CompressionResultProps) {
  return (
    <section className="compression-result-enter relative overflow-hidden rounded-lg border border-emerald-500/25 bg-[linear-gradient(135deg,rgb(6_78_59_/_0.16),hsl(var(--card))_58%)] p-4 shadow-soft backdrop-blur">
      <div className="relative z-10 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-400/25 bg-emerald-400/10 text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </span>
        <h2 className="text-sm font-semibold text-foreground">
          Compression complete
        </h2>
      </div>
      <Button
        className="relative z-10 mt-3 w-full border-emerald-400/20 bg-background/45 text-foreground hover:border-emerald-400/35 hover:bg-emerald-400/10 hover:text-emerald-100"
        onClick={onOpenFolder}
        type="button"
        variant="outline"
      >
        <FolderOpen />
        Open folder
      </Button>
    </section>
  )
}
