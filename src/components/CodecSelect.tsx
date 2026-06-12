import type { CompressionCodec } from '../../electron/types/compression'

interface CodecSelectProps {
  codec: CompressionCodec
  onCodecChange: (codec: CompressionCodec) => void
}

export function CodecSelect({ codec, onCodecChange }: CodecSelectProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">Codec</span>
      <select
        className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
        value={codec}
        onChange={(event) =>
          onCodecChange(event.target.value as CompressionCodec)
        }
      >
        <option value="h264">AVC (H.264)</option>
        <option value="h265">HEVC (H.265)</option>
      </select>
    </label>
  )
}
