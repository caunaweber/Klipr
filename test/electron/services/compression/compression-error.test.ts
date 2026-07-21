import {
  describe,
  expect,
  it,
} from 'vitest'
import {
  createCompressionProcessError,
  GPU_ENCODING_FAILED,
} from '../../../../electron/services/compression/compression-error'
import {
  getEncoderDefinition,
} from '../../../../electron/utils/encoder.utils'

describe('createCompressionProcessError', () => {
  it('preserves FFmpeg details for CPU failures', () => {
    const encoder =
      getEncoderDefinition('cpu-h265')

    const error = createCompressionProcessError(
      encoder,
      1,
      'CPU encoder failed',
    )

    expect(error.message).toContain(
      'FFmpeg exited with code 1'
    )
    expect(error.message).toContain(
      'CPU encoder failed'
    )
  })

  it('classifies NVENC failures without exposing stderr', () => {
    const encoder =
      getEncoderDefinition('nvenc-h264')

    const error = createCompressionProcessError(
      encoder,
      1,
      'sensitive FFmpeg details',
    )

    expect(error.message).toBe(
      `${GPU_ENCODING_FAILED}:h264_nvenc`
    )
    expect(error.message).not.toContain(
      'sensitive FFmpeg details'
    )
  })

  it('classifies AMF failures without exposing stderr', () => {
    const encoder =
      getEncoderDefinition('amf-h265')

    const error = createCompressionProcessError(
      encoder,
      1,
      'AMF initialization failed',
    )

    expect(error.message).toBe(
      `${GPU_ENCODING_FAILED}:hevc_amf`
    )
    expect(error.message).not.toContain(
      'AMF initialization failed'
    )
  })
})
