import type { EncoderDefinition } from '../../utils/encoder.utils'

export const GPU_ENCODING_FAILED =
  'GPU_ENCODING_FAILED'

export function createCompressionProcessError(
  encoder: EncoderDefinition,
  exitCode: number | null,
  stderr: string,
): Error {
  if (encoder.technology !== 'cpu') {
    return new Error(
      `${GPU_ENCODING_FAILED}:${encoder.ffmpegName}`
    )
  }

  return new Error(
    `FFmpeg exited with code ${exitCode}\n${stderr}`
  )
}
