import path from 'node:path'
import {
  describe,
  expect,
  it,
} from 'vitest'
import { buildOutputPath } from './file.utils'

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
})
