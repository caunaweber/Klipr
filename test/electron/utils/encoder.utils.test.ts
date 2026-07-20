import {
  describe,
  expect,
  it,
} from 'vitest'
import {
  getEncoderDefinition,
  getEncoderDefinitions,
  isEncoderId,
  toEncoderCapability,
} from '../../../electron/utils/encoder.utils'

describe('encoder catalog', () => {
  it('maps every Klipr encoder ID to the correct FFmpeg encoder', () => {
    const mappings = getEncoderDefinitions().map(
      ({ id, ffmpegName }) => ({
        id,
        ffmpegName,
      })
    )

    expect(mappings).toEqual([
      {
        id: 'cpu-h264',
        ffmpegName: 'libx264',
      },
      {
        id: 'cpu-h265',
        ffmpegName: 'libx265',
      },
      {
        id: 'nvenc-h264',
        ffmpegName: 'h264_nvenc',
      },
      {
        id: 'nvenc-h265',
        ffmpegName: 'hevc_nvenc',
      },
      {
        id: 'amf-h264',
        ffmpegName: 'h264_amf',
      },
      {
        id: 'amf-h265',
        ffmpegName: 'hevc_amf',
      },
    ])
  })

  it('finds an encoder definition by its Klipr ID', () => {
    const definition =
      getEncoderDefinition('nvenc-h265')

    expect(definition).toMatchObject({
      technology: 'nvenc',
      codec: 'h265',
      ffmpegName: 'hevc_nvenc',
    })
  })

  it('validates encoder IDs at runtime', () => {
    expect(isEncoderId('cpu-h264')).toBe(true)
    expect(isEncoderId('h264_nvenc')).toBe(false)
    expect(isEncoderId('arbitrary-encoder')).toBe(false)
    expect(isEncoderId(null)).toBe(false)
  })

  it('rejects values outside the fixed encoder catalog', () => {
    expect(() =>
      getEncoderDefinition('h264_nvenc')
    ).toThrow('Invalid encoder selection')
  })

  it('removes the internal FFmpeg name from public capabilities', () => {
    const definition =
      getEncoderDefinition('amf-h264')

    const capability =
      toEncoderCapability(definition)

    expect(capability).toEqual({
      id: 'amf-h264',
      technology: 'amf',
      codec: 'h264',
      label: 'AVC (H.264) — AMD AMF',
      description: 'Hardware encoding with AMD GPU',
    })

    expect(capability).not.toHaveProperty(
      'ffmpegName'
    )
  })
})
