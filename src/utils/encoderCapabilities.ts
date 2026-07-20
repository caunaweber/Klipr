import type { EncoderCapabilities, EncoderCapability, EncoderId } from '../../electron/types/encoder'

export const DEFAULT_ENCODER_ID: EncoderId = 'cpu-h265'

export const CPU_ENCODER_FALLBACK: readonly EncoderCapability[] = [
  {
    id: 'cpu-h264',
    technology: 'cpu',
    codec: 'h264',
    label: 'AVC (H.264)',
    description: 'Software encoding with CPU',
  },
  {
    id: 'cpu-h265',
    technology: 'cpu',
    codec: 'h265',
    label: 'HEVC (H.265)',
    description: 'Software encoding with CPU',
  },
]

export function getAvailableEncoders( capabilities: EncoderCapabilities ): EncoderCapability[] {
  return capabilities.encoders.length > 0 ? capabilities.encoders : [...CPU_ENCODER_FALLBACK]
}

export function resolveSelectedEncoder( encoders: readonly EncoderCapability[], selectedEncoderId: EncoderId ): EncoderCapability {
  return (
    encoders.find((encoder) => encoder.id === selectedEncoderId) ??
    encoders.find((encoder) => encoder.id === DEFAULT_ENCODER_ID) ??
    encoders[0] ??
    CPU_ENCODER_FALLBACK[1]
  )
}
