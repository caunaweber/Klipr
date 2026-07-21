import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { EncoderCapabilities } from '../../../../electron/types/encoder'

const mocks = vi.hoisted(() => ({
  getEncoderCapabilities: vi.fn<
    () => Promise<EncoderCapabilities>
  >(),
}))

vi.mock(
  '../../../../electron/services/encoder/encoder-capabilities.services',
  () => ({
    getEncoderCapabilities: mocks.getEncoderCapabilities,
  }),
)

import {
  resolveAvailableEncoder,
  resolveCompressionEncoder,
} from '../../../../electron/services/encoder/encoder-selection.services'

describe('resolveAvailableEncoder', () => {
  beforeEach(() => {
    mocks.getEncoderCapabilities.mockReset()
  })

  it('resolves a catalog encoder that is available', async () => {
    mocks.getEncoderCapabilities.mockResolvedValue({
      encoders: [
        {
          id: 'nvenc-h265',
          technology: 'nvenc',
          codec: 'h265',
          label: 'HEVC (H.265) — NVIDIA NVENC',
          description: 'Hardware encoding with NVIDIA GPU',
        },
      ],
    })

    await expect(
      resolveAvailableEncoder('nvenc-h265'),
    ).resolves.toMatchObject({
      id: 'nvenc-h265',
      codec: 'h265',
      ffmpegName: 'hevc_nvenc',
    })
  })

  it('rejects a known encoder that is unavailable', async () => {
    mocks.getEncoderCapabilities.mockResolvedValue({
      encoders: [
        {
          id: 'cpu-h265',
          technology: 'cpu',
          codec: 'h265',
          label: 'HEVC (H.265)',
          description: 'Software encoding with CPU',
        },
      ],
    })

    await expect(
      resolveAvailableEncoder('amf-h265'),
    ).rejects.toThrow('Selected encoder is not available')
  })

  it('rejects a value outside the fixed catalog before detection', async () => {
    await expect(
      resolveAvailableEncoder(
        'arbitrary-encoder' as never,
      ),
    ).rejects.toThrow('Invalid encoder selection')

    expect(
      mocks.getEncoderCapabilities,
    ).not.toHaveBeenCalled()
  })

  it('allows an available CPU encoder in the current compression pipeline', async () => {
    mocks.getEncoderCapabilities.mockResolvedValue({
      encoders: [
        {
          id: 'cpu-h264',
          technology: 'cpu',
          codec: 'h264',
          label: 'AVC (H.264)',
          description: 'Software encoding with CPU',
        },
      ],
    })

    await expect(
      resolveCompressionEncoder('cpu-h264'),
    ).resolves.toMatchObject({
      id: 'cpu-h264',
      codec: 'h264',
    })
  })

  it('allows an available NVENC encoder', async () => {
    mocks.getEncoderCapabilities.mockResolvedValue({
      encoders: [
        {
          id: 'nvenc-h264',
          technology: 'nvenc',
          codec: 'h264',
          label: 'AVC (H.264) — NVIDIA NVENC',
          description: 'Hardware encoding with NVIDIA GPU',
        },
      ],
    })

    await expect(
      resolveCompressionEncoder('nvenc-h264'),
    ).resolves.toMatchObject({
      id: 'nvenc-h264',
      technology: 'nvenc',
      ffmpegName: 'h264_nvenc',
    })
  })

  it('keeps AMF blocked until it is implemented', async () => {
    mocks.getEncoderCapabilities.mockResolvedValue({
      encoders: [
        {
          id: 'amf-h264',
          technology: 'amf',
          codec: 'h264',
          label: 'AVC (H.264) — AMD AMF',
          description: 'Hardware encoding with AMD GPU',
        },
      ],
    })

    await expect(
      resolveCompressionEncoder('amf-h264'),
    ).rejects.toThrow(
      'AMD AMF encoding is not enabled yet'
    )
  })
})
