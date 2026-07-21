import type { EncoderDefinition } from '../../utils/encoder.utils'

export function buildEncoderArguments(encoder: EncoderDefinition, bitrateKbps: number): string[] {
  if (encoder.technology !== 'cpu') {
    throw new Error(
      'GPU encoder arguments are not implemented yet'
    )
  }

  return [
    '-c:v',
    encoder.ffmpegName,

    '-preset',
    'slow',

    '-b:v',
    `${bitrateKbps}k`,
  ]
}