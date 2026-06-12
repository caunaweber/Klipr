interface CompressionProgressProps {
  progress: number
}

export function CompressionProgress({ progress }: CompressionProgressProps) {
  return <progress value={progress} max={100} />
}
