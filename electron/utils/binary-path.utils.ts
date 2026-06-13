import fs from 'node:fs'

export function resolvePackagedBinaryPath(binaryPath: string | null): string {
  if (!binaryPath) {
    throw new Error('Required binary is not available for this platform')
  }

  const unpackedPath = binaryPath.replace(
    /app\.asar(?=$|[\\/])/,
    'app.asar.unpacked'
  )

  return fs.existsSync(unpackedPath)
    ? unpackedPath
    : binaryPath
}
