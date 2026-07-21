import path from 'node:path'
import {
  describe,
  expect,
  it,
} from 'vitest'
import { buildOutputPath } from '../../../electron/utils/file.utils'

describe('buildOutputPath', () => {
  it('builds a compression filename with codec and target size', () => {
    const outputPath = buildOutputPath(
      path.join('videos', 'gameplay.mp4'),
      'h265',
      10,
    )

    expect(path.basename(outputPath)).toBe(
      'gameplay-hevc-10MB-compressed.mp4'
    )
  })

  it('includes the selected FPS and normalizes decimal target sizes', () => {
    const outputPath = buildOutputPath(
      path.join('videos', 'gameplay.mp4'),
      'h264',
      7.5,
      60,
    )

    expect(path.basename(outputPath)).toBe(
      'gameplay-avc-7_5MB-60fps-compressed.mp4'
    )
  })

  it('includes NVENC in GPU output filenames', () => {
    const outputPath = buildOutputPath(
      path.join('videos', 'gameplay.mp4'),
      'h265',
      10,
      'native',
      'nvenc',
    )

    expect(path.basename(outputPath)).toBe(
      'gameplay-hevc-10MB-nvenc-compressed.mp4'
    )
  })

  it('includes AMF in GPU output filenames', () => {
    const outputPath = buildOutputPath(
      path.join('videos', 'gameplay.mp4'),
      'h264',
      10,
      'native',
      'amf',
    )

    expect(path.basename(outputPath)).toBe(
      'gameplay-avc-10MB-amf-compressed.mp4'
    )
  })
})
