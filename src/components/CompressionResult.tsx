import { CheckCircle2 } from 'lucide-react'
import type { CompressionResult as CompressionResultType } from '../../electron/types/compression'

interface CompressionResultProps {
  result: CompressionResultType
}

export function CompressionResult({ result }: CompressionResultProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">Compression complete</h2>
          <p className="mt-1 break-words text-sm text-muted-foreground">
            Video saved to: {result.outputPath}
          </p>
        </div>
      </div>
    </section>
  )
}
