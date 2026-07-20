import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type {
  FfmpegEncoderName,
} from '../../utils/encoder.utils'

const mocks = vi.hoisted(() => ({
  listFfmpegEncoders: vi.fn<
    () => Promise<Set<FfmpegEncoderName>>
  >(),
  probeFfmpegEncoder: vi.fn<
    (encoderName: FfmpegEncoderName) => Promise<boolean>
  >(),
}))

vi.mock(
  './encoder-listing.services',
  () => ({
    listFfmpegEncoders:
      mocks.listFfmpegEncoders,
  })
)

vi.mock(
  './encoder-probe.services',
  () => ({
    probeFfmpegEncoder:
      mocks.probeFfmpegEncoder,
  })
)

async function loadEncoderCapabilitiesService() {
  return import(
    './encoder-capabilities.services'
  )
}

describe('getEncoderCapabilities', () => {
  beforeEach(() => {
    vi.resetModules()
    mocks.listFfmpegEncoders.mockReset()
    mocks.probeFfmpegEncoder.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('only probes GPU encoders listed by FFmpeg', async () => {
    mocks.listFfmpegEncoders.mockResolvedValue(
      new Set<FfmpegEncoderName>([
        'hevc_amf',
      ])
    )
    mocks.probeFfmpegEncoder.mockResolvedValue(
      true
    )

    const {
      getEncoderCapabilities,
    } = await loadEncoderCapabilitiesService()

    const capabilities =
      await getEncoderCapabilities()

    expect(
      mocks.probeFfmpegEncoder
    ).toHaveBeenCalledTimes(1)
    expect(
      mocks.probeFfmpegEncoder
    ).toHaveBeenCalledWith('hevc_amf')
    expect(
      capabilities.encoders.map(
        (encoder) => encoder.id
      )
    ).toEqual([
      'cpu-h264',
      'cpu-h265',
      'amf-h265',
    ])
  })

  it('includes approved probes and excludes rejected probes in catalog order', async () => {
    mocks.listFfmpegEncoders.mockResolvedValue(
      new Set<FfmpegEncoderName>([
        'h264_nvenc',
        'hevc_nvenc',
        'h264_amf',
        'hevc_amf',
      ])
    )
    mocks.probeFfmpegEncoder.mockImplementation(
      async (encoderName) =>
        encoderName === 'h264_nvenc' ||
        encoderName === 'h264_amf'
    )

    const {
      getEncoderCapabilities,
    } = await loadEncoderCapabilitiesService()

    const capabilities =
      await getEncoderCapabilities()

    expect(
      capabilities.encoders.map(
        (encoder) => encoder.id
      )
    ).toEqual([
      'cpu-h264',
      'cpu-h265',
      'nvenc-h264',
      'amf-h264',
    ])
  })

  it('returns only CPU capabilities when listing FFmpeg encoders fails', async () => {
    const error =
      new Error('FFmpeg listing failed')
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    mocks.listFfmpegEncoders.mockRejectedValue(
      error
    )

    const {
      getEncoderCapabilities,
    } = await loadEncoderCapabilitiesService()

    const capabilities =
      await getEncoderCapabilities()

    expect(
      capabilities.encoders.map(
        (encoder) => encoder.id
      )
    ).toEqual([
      'cpu-h264',
      'cpu-h265',
    ])
    expect(
      mocks.probeFfmpegEncoder
    ).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledWith(
      'Encoder detection failed:',
      error
    )
  })

  it('reuses the same detection promise for repeated calls', async () => {
    mocks.listFfmpegEncoders.mockResolvedValue(
      new Set<FfmpegEncoderName>()
    )

    const {
      getEncoderCapabilities,
    } = await loadEncoderCapabilitiesService()

    const firstCall =
      getEncoderCapabilities()
    const secondCall =
      getEncoderCapabilities()

    expect(secondCall).toBe(firstCall)

    await Promise.all([
      firstCall,
      secondCall,
    ])

    expect(
      mocks.listFfmpegEncoders
    ).toHaveBeenCalledTimes(1)
    expect(
      mocks.probeFfmpegEncoder
    ).not.toHaveBeenCalled()
  })

  it('starts all eligible GPU probes without waiting for earlier probes', async () => {
    mocks.listFfmpegEncoders.mockResolvedValue(
      new Set<FfmpegEncoderName>([
        'h264_nvenc',
        'hevc_nvenc',
        'h264_amf',
        'hevc_amf',
      ])
    )

    const probeResolvers: Array<
      (isAvailable: boolean) => void
    > = []

    mocks.probeFfmpegEncoder.mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          probeResolvers.push(resolve)
        })
    )

    const {
      getEncoderCapabilities,
    } = await loadEncoderCapabilitiesService()

    const capabilitiesPromise =
      getEncoderCapabilities()

    await vi.waitFor(() => {
      expect(
        mocks.probeFfmpegEncoder
      ).toHaveBeenCalledTimes(4)
    })

    for (const resolve of probeResolvers) {
      resolve(true)
    }

    const capabilities =
      await capabilitiesPromise

    expect(
      capabilities.encoders.map(
        (encoder) => encoder.id
      )
    ).toEqual([
      'cpu-h264',
      'cpu-h265',
      'nvenc-h264',
      'nvenc-h265',
      'amf-h264',
      'amf-h265',
    ])
  })
})
