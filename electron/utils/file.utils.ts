import path from 'node:path'
import { CompressionCodec } from '../types/compression'

export function buildOutputPath(
  filePath: string,
  codec: CompressionCodec,
  targetSizeMB: number,
  useTwoPass: boolean
): string {

  const parsedFile =
    path.parse(filePath)

  const passMode =
    useTwoPass
      ? '2pass'
      : '1pass'

  const sizeLabel =
    targetSizeMB
      .toString()
      .replace('.', '_')

  const codecName =
    codec === 'h265'
      ? 'hevc'
      : 'avc'

  return path.join(
    parsedFile.dir,
    `${parsedFile.name}-${codecName}-${passMode}-${sizeLabel}MB-compressed.mp4`
  )
}