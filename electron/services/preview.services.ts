import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { resolvePackagedBinaryPath } from '../utils/binary-path.utils'

const execFileAsync = promisify(execFile)
const require = createRequire(import.meta.url)
const ffmpegPath = resolvePackagedBinaryPath(require('ffmpeg-static'))

const PREVIEW_FILE_PREFIX = 'klipr-preview-'
const PREVIEW_FILE_PATTERN = /^klipr-preview-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.mp4$/i

export async function clearStaleVideoPreviews(temporaryDirectory = os.tmpdir(),) {
  try {
    const entries = await fs.readdir(temporaryDirectory, {
      withFileTypes: true,
    })

    const stalePreviewPaths = entries
      .filter((entry) => entry.isFile() && PREVIEW_FILE_PATTERN.test(entry.name))
      .map((entry) => path.join(temporaryDirectory, entry.name))

    await Promise.all(
      stalePreviewPaths.map((previewPath) =>
        fs.unlink(previewPath).catch((error) => {
          console.warn('Could not remove stale video preview:', error)
        }),
      ),
    )
  } catch (error) {
    console.warn('Could not inspect temporary video previews:', error)
  }
}

async function hasTrailingMoovAtom(filePath: string) {
  const file = await fs.open(filePath, 'r')

  try {
    const { size: fileSize } = await file.stat()
    const header = Buffer.alloc(16)
    let offset = 0
    let mdatOffset = -1
    let moovOffset = -1

    while (offset + 8 <= fileSize) {
      const { bytesRead } = await file.read(header, 0, 16, offset)

      if (bytesRead < 8) {
        break
      }

      const atomSize32 = header.readUInt32BE(0)
      const atomType = header.toString('ascii', 4, 8)
      const headerSize = atomSize32 === 1 ? 16 : 8
      let atomSize = atomSize32

      if (atomSize32 === 1) {
        if (bytesRead < 16) {
          break
        }

        const extendedSize = header.readBigUInt64BE(8)

        if (extendedSize > BigInt(Number.MAX_SAFE_INTEGER)) {
          break
        }

        atomSize = Number(extendedSize)
      } else if (atomSize32 === 0) {
        atomSize = fileSize - offset
      }

      if (atomSize < headerSize || offset + atomSize > fileSize) {
        break
      }

      if (atomType === 'mdat') {
        mdatOffset = offset
      } else if (atomType === 'moov') {
        moovOffset = offset
      }

      if (mdatOffset >= 0 && moovOffset >= 0) {
        return moovOffset > mdatOffset
      }

      offset += atomSize
    }

    return false
  } finally {
    await file.close()
  }
}

export async function prepareVideoPreview(filePath: string) {
  if (
    path.extname(filePath).toLowerCase() !== '.mp4' ||
    !(await hasTrailingMoovAtom(filePath))
  ) {
    return filePath
  }

  const previewPath = path.join(
    os.tmpdir(),
    `${PREVIEW_FILE_PREFIX}${randomUUID()}.mp4`,
  )

  try {
    await execFileAsync(
      ffmpegPath,
      [
        '-v',
        'error',
        '-y',
        '-i',
        filePath,
        '-map',
        '0:v:0',
        '-map',
        '0:a?',
        '-c',
        'copy',
        '-movflags',
        '+faststart',
        '-avoid_negative_ts',
        'make_zero',
        previewPath,
      ],
    )

    return previewPath
  } catch (error) {
    await fs.unlink(previewPath).catch(() => undefined)
    console.warn('Could not prepare optimized video preview:', error)
    return filePath
  }
}
