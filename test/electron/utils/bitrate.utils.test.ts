import {
  describe,
  expect,
  it,
} from 'vitest'
import {
  calculateVideoBitrate,
} from '../../../electron/utils/bitrate.utils'

describe('calculateVideoBitrate', () => {
  it('keeps the current CPU bitrate calculation', () => {
    const result = calculateVideoBitrate(
      9,
      17.209,
      'cpu',
    )

    expect(result).toEqual({
      bitrateKbps: 4203,
      audioBitrateKbps: 96,
    })
  })

  it('applies the NVENC safety factor', () => {
    const result = calculateVideoBitrate(
      9,
      17.209,
      'nvenc',
    )

    expect(result.bitrateKbps).toBe(3993)
  })

  it('applies the AMF safety factor', () => {
    const result = calculateVideoBitrate(
      9,
      17.209,
      'amf',
    )

    expect(result.bitrateKbps).toBe(3993)
  })

  it('applies the same GPU safety factor below CPU', () => {
    const cpu = calculateVideoBitrate(
      10,
      30,
      'cpu',
    )
    const nvenc = calculateVideoBitrate(
      10,
      30,
      'nvenc',
    )
    const amf = calculateVideoBitrate(
      10,
      30,
      'amf',
    )

    expect(nvenc.bitrateKbps)
      .toBeLessThan(cpu.bitrateKbps)
    expect(amf.bitrateKbps)
      .toBeLessThan(cpu.bitrateKbps)
    expect(amf.bitrateKbps)
      .toBe(nvenc.bitrateKbps)
  })

  it('rejects targets that leave less than 100 kbps for video', () => {
    expect(() =>
      calculateVideoBitrate(
        0.1,
        60,
        'amf',
      )
    ).toThrow(
      'Target size is too small for this video.'
    )
  })
})
