import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { clearStaleVideoPreviews } from '../../../electron/services/preview.services'

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
