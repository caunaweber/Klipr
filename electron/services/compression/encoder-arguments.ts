import type { EncoderDefinition } from '../../utils/encoder.utils'

export function buildEncoderArguments(encoder: EncoderDefinition, bitrateKbps: number): string[] {

  if (encoder.technology === 'cpu') {
    return [
      '-c:v',
      encoder.ffmpegName,

      '-preset',
      'slow',

      '-b:v',
      `${bitrateKbps}k`,
    ]
  }

  if (encoder.technology === 'nvenc') {
    return [
      '-c:v',
      encoder.ffmpegName,

      '-preset',
      'p5',

      '-tune',
      'hq',

      '-rc',
      'vbr',

      '-b:v',
      `${bitrateKbps}k`,

      '-pix_fmt',
      'yuv420p',
    ]
  }

  throw new Error(
    'AMD AMF encoder arguments are not implemented yet'
  )
}
