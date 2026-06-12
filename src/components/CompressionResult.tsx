import type { CompressionResult as CompressionResultType } from '../../electron/types/compression'

interface CompressionResultProps {
  result: CompressionResultType
}

export function CompressionResult({ result }: CompressionResultProps) {
  return <p>Video saved to: {result.outputPath}</p>
}
