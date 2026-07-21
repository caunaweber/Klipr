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

export async function resolveCompressionEncoder(encoderId: EncoderId): Promise<EncoderDefinition> {
  const definition = await resolveAvailableEncoder(encoderId)

  if (definition.technology === 'amf') {
    throw new Error(
      'AMD AMF encoding is not enabled yet'
    )
  }

  return definition
}
