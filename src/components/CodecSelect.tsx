import type { CompressionCodec } from '../../electron/types/compression'
import { Tooltip } from './Tooltip'

interface CodecSelectProps {
  codec: CompressionCodec
  onCodecChange: (codec: CompressionCodec) => void
}

export function CodecSelect({ codec, onCodecChange }: CodecSelectProps) {
  const tooltip =
    codec === 'h265'
      ? 'Slower but better quality'
      : 'Faster, lower quality and lower precision'

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">Codec</span>
      <Tooltip content={tooltip}>
        <select
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
          value={codec}
          onChange={(event) =>
            onCodecChange(event.target.value as CompressionCodec)
          }
        >
          <option value="h264">AVC (H.264)</option>
          <option value="h265">HEVC (H.265)</option>
        </select>
      </Tooltip>
    </label>
  )
}
