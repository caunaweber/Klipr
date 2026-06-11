import { randomUUID } from 'node:crypto'

const generatedOutputs = new Map<string, string>()

export function registerGeneratedOutput(filePath: string) {
  const id = randomUUID()
  generatedOutputs.set(id, filePath)
  return id
}

export function getGeneratedOutputPath(id: string) {
  return generatedOutputs.get(id) ?? null
}