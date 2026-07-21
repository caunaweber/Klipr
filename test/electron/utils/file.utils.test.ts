import path from 'node:path'
import fs from 'node:fs/promises'
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import {
  buildOutputPath,
  removeFileIfExistsBestEffort,
} from '../../../electron/utils/file.utils'

afterEach(() => {
  vi.restoreAllMocks()
})

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

  it('does not fail when cleanup cannot remove an incomplete output', async () => {
    const cleanupError = Object.assign(
      new Error('File is locked'),
      { code: 'EPERM' }
    )

    vi.spyOn(fs, 'unlink')
      .mockRejectedValueOnce(cleanupError)

    const consoleWarning = vi.spyOn(console, 'warn')
      .mockImplementation(() => undefined)

    await expect(
      removeFileIfExistsBestEffort('locked-output.mp4')
    ).resolves.toBeUndefined()

    expect(consoleWarning).toHaveBeenCalledWith(
      'Could not remove incomplete output file:',
      cleanupError
    )
  })
})
