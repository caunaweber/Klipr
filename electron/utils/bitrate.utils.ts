import type { EncoderTechnology } from '../types/encoder'

const CONTAINER_OVERHEAD_FACTOR = 0.98

const RATE_CONTROL_FACTOR: Record<EncoderTechnology, number> = {
  cpu: 1,
  nvenc: 0.95,
  amf: 0.95,
}

export function calculateVideoBitrate(
  targetSizeMB: number,
  duration: number,
  technology: EncoderTechnology,
  audioBitrateKbps = 96
) {
  const targetBits = targetSizeMB * 1024 * 1024 * 8 * CONTAINER_OVERHEAD_FACTOR

  const audioBits = audioBitrateKbps * 1000 * duration

  const availableVideoBits = targetBits - audioBits

  const baseVideoBitrateKbps = availableVideoBits / duration / 1000

  const bitrateKbps = Math.round(
    baseVideoBitrateKbps * RATE_CONTROL_FACTOR[technology]
  )

  if (bitrateKbps < 100) {
    throw new Error('Target size is too small for this video.')
  }

  return { bitrateKbps, audioBitrateKbps }
}
