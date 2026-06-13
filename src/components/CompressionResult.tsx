import { FolderOpen } from 'lucide-react'
import { Button } from './ui/button'

interface CompressionResultProps {
  onOpenFolder: () => void
}

export function CompressionResult({
  onOpenFolder,
}: CompressionResultProps) {
  return (
    <section className="rounded-lg border border-border/80 bg-card/85 p-4 shadow-soft backdrop-blur">
      <h2 className="text-sm font-semibold">Compression complete</h2>
      <Button className="mt-3 w-full" onClick={onOpenFolder} type="button">
        <FolderOpen />
        Open folder
      </Button>
    </section>
  )
}
