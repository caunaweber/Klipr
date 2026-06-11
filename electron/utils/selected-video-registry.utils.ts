import { randomUUID } from 'node:crypto'

const selectedVideos = new Map<string, string>()

export function registerSelectedVideo(filePath: string) {
  selectedVideos.clear()

  const id = randomUUID()
  selectedVideos.set(id, filePath)
  return id
}

export function getSelectedVideoPath(id: string) {
  return selectedVideos.get(id) ?? null
}
