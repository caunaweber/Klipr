import type { CompressionCodec } from '../../electron/types/compression'

interface CodecSelectProps {
  codec: CompressionCodec
  onCodecChange: (codec: CompressionCodec) => void
}

export function CodecSelect({ codec, onCodecChange }: CodecSelectProps) {
  return (
    <label className="field">
      <span>Codec:</span>
      <select
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
