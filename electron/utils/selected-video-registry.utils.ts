import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'

interface SelectedVideoEntry {
  previewPath: string
  sourcePath: string
}

const selectedVideos = new Map<string, SelectedVideoEntry>()

async function removeTemporaryPreview(entry: SelectedVideoEntry) {
  if (entry.previewPath === entry.sourcePath) {
    return
  }

  await fs.unlink(entry.previewPath).catch((error) => {
    console.warn('Could not remove temporary video preview:', error)
  })
}

export function registerSelectedVideo(
  sourcePath: string,
  previewPath = sourcePath,
) {
  for (const entry of selectedVideos.values()) {
    void removeTemporaryPreview(entry)
  }

  selectedVideos.clear()

  const id = randomUUID()
  selectedVideos.set(id, { previewPath, sourcePath })
  return id
}

export function getSelectedVideoPath(id: string) {
  return selectedVideos.get(id)?.sourcePath ?? null
}

export function getSelectedVideoPreviewPath(id: string) {
  return selectedVideos.get(id)?.previewPath ?? null
}

export async function clearSelectedVideos() {
  const entries = [...selectedVideos.values()]
  selectedVideos.clear()
  await Promise.all(entries.map(removeTemporaryPreview))
}
