import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  buildPreviewArguments,
  clearStaleVideoPreviews,
} from '../../../electron/services/preview.services'

const temporaryDirectories: string[] = []

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      fs.rm(directory, { force: true, recursive: true }),
    ),
  )
})

describe('clearStaleVideoPreviews', () => {
  it('removes only Klipr preview files with the expected UUID name', async () => {
    const temporaryDirectory = await fs.mkdtemp(
      path.join(os.tmpdir(), 'klipr-preview-cleanup-test-'),
    )
    temporaryDirectories.push(temporaryDirectory)

    const stalePreviewName =
      'klipr-preview-12345678-1234-1234-1234-123456789abc.mp4'
    const unrelatedFileName = 'klipr-preview-not-a-uuid.mp4'
    const matchingDirectoryName =
      'klipr-preview-abcdefab-cdef-abcd-efab-cdefabcdefab.mp4'

    await Promise.all([
      fs.writeFile(path.join(temporaryDirectory, stalePreviewName), ''),
      fs.writeFile(path.join(temporaryDirectory, unrelatedFileName), ''),
      fs.mkdir(path.join(temporaryDirectory, matchingDirectoryName)),
    ])

    await clearStaleVideoPreviews(temporaryDirectory)

    const remainingEntries = await fs.readdir(temporaryDirectory)

    expect(remainingEntries).toEqual(
      expect.arrayContaining([
        unrelatedFileName,
        matchingDirectoryName,
      ]),
    )
    expect(remainingEntries).not.toContain(stalePreviewName)
  })
})

describe('buildPreviewArguments', () => {
  it('copies a regular video and its first optional audio track', () => {
    expect(buildPreviewArguments('input.mp4', 'preview.mp4', 1)).toEqual([
      '-v',
      'error',
      '-y',
      '-i',
      'input.mp4',
      '-map',
      '0:v:0',
      '-map',
      '0:a:0?',
      '-c:v',
      'copy',
      '-c:a',
      'copy',
      '-movflags',
      '+faststart',
      '-avoid_negative_ts',
      'make_zero',
      'preview.mp4',
    ])
  })

  it('mixes multiple audio tracks while copying the primary video', () => {
    const argumentsList = buildPreviewArguments(
      'input.mkv',
      'preview.mp4',
      2,
    )

    expect(argumentsList).toContain(
      '[0:a:0]aformat=sample_fmts=fltp:channel_layouts=stereo[a0];' +
        '[0:a:1]aformat=sample_fmts=fltp:channel_layouts=stereo[a1];' +
        '[a0][a1]amix=inputs=2:duration=longest:normalize=1[a]',
    )
    expect(argumentsList).toEqual(expect.arrayContaining([
      '-map',
      '0:v:0',
      '-map',
      '[a]',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-ac',
      '2',
    ]))
  })
})
