import {
  describe,
  expect,
  it,
} from 'vitest'
import {
  parseListedFfmpegEncoders,
} from '../../../electron/utils/ffmpeg-encoder-parser.utils'

describe('parseListedFfmpegEncoders', () => {
  it('extracts the known encoders from FFmpeg output', () => {
    const output = `
Encoders:
 V....D libx264      libx264 H.264 encoder
 V....D libx265      libx265 HEVC encoder
 V....D h264_nvenc   NVIDIA NVENC H.264 encoder
 V....D hevc_nvenc   NVIDIA NVENC HEVC encoder
 V....D h264_amf     AMD AMF H.264 encoder
 V....D hevc_amf     AMD AMF HEVC encoder
`

    const result =
      parseListedFfmpegEncoders(output)

    expect([...result]).toEqual([
      'libx264',
      'libx265',
      'h264_nvenc',
      'hevc_nvenc',
      'h264_amf',
      'hevc_amf',
    ])
  })

  it('ignores encoders outside the Klipr catalog', () => {
    const output = `
 V....D av1_nvenc    NVIDIA NVENC AV1 encoder
 V....D av1_amf      AMD AMF AV1 encoder
 V....D vp9_qsv      Intel Quick Sync VP9 encoder
 V....D h264_nvenc   NVIDIA NVENC H.264 encoder
`

    const result =
      parseListedFfmpegEncoders(output)

    expect([...result]).toEqual([
      'h264_nvenc',
    ])
  })

  it('ignores malformed lines and removes duplicates', () => {
    const output = [
      'h264_nvenc',
      'invalid line',
      ' V....D h264_nvenc NVIDIA encoder',
      ' V....D h264_nvenc NVIDIA encoder',
      ' V....D hevc_amf AMD encoder',
    ].join('\r\n')

    const result =
      parseListedFfmpegEncoders(output)

    expect([...result]).toEqual([
      'h264_nvenc',
      'hevc_amf',
    ])
  })

  it('returns an empty set when no known encoder is listed', () => {
    const result =
      parseListedFfmpegEncoders('')

    expect(result.size).toBe(0)
  })
})
