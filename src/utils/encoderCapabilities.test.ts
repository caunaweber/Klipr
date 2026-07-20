import { describe, expect, it } from 'vitest'
import type { EncoderCapability } from '../../electron/types/encoder'
import {
  CPU_ENCODER_FALLBACK,
  getAvailableEncoders,
  resolveSelectedEncoder,
} from './encoderCapabilities'

const NVENC_H264: EncoderCapability = {
  id: 'nvenc-h264',
  technology: 'nvenc',
  codec: 'h264',
  label: 'AVC (H.264) — NVIDIA NVENC',
  description: 'Hardware encoding with NVIDIA GPU',
}

describe('encoder capabilities for the renderer', () => {
  it('preserves the capabilities and their backend order', () => {
    const encoders = getAvailableEncoders({
      encoders: [
        ...CPU_ENCODER_FALLBACK,
        NVENC_H264,
      ],
    })

    expect(encoders.map((encoder) => encoder.id)).toEqual([
      'cpu-h264',
      'cpu-h265',
      'nvenc-h264',
    ])
  })

  it('uses CPU options when the capability response is empty', () => {
    const encoders = getAvailableEncoders({ encoders: [] })

    expect(encoders).toEqual(CPU_ENCODER_FALLBACK)
  })

  it('keeps the selected encoder when it remains available', () => {
    const selected = resolveSelectedEncoder(
      [...CPU_ENCODER_FALLBACK, NVENC_H264],
      'nvenc-h264',
    )

    expect(selected.id).toBe('nvenc-h264')
  })

  it('falls back to CPU HEVC when the selection is unavailable', () => {
    const selected = resolveSelectedEncoder(
      CPU_ENCODER_FALLBACK,
      'amf-h265',
    )

    expect(selected.id).toBe('cpu-h265')
  })
})
