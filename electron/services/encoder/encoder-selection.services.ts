import type { EncoderId } from '../../types/encoder'
import { getEncoderDefinition, type EncoderDefinition } from '../../utils/encoder.utils'
import { getEncoderCapabilities } from './encoder-capabilities.services'

export async function resolveAvailableEncoder(encoderId: EncoderId): Promise<EncoderDefinition> {
  const definition = getEncoderDefinition(encoderId)
  const capabilities = await getEncoderCapabilities()
  const isAvailable = capabilities.encoders.some((encoder) => encoder.id === definition.id)

  if (!isAvailable) {
    throw new Error('Selected encoder is not available')
  }
  return definition
}

export const resolveCompressionEncoder = resolveAvailableEncoder
