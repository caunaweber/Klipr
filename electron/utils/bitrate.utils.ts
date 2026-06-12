export function calculateVideoBitrate(
  targetSizeMB: number,
  duration: number,
  audioBitrateKbps = 96
) {
  const overheadFactor = 0.98

  const targetBits =
    targetSizeMB * 1024 * 1024 * 8 * overheadFactor

  const audioBits =
    audioBitrateKbps * 1000 * duration

  const videoBits =
    targetBits - audioBits

  const bitrateKbps =
    Math.round(videoBits / duration / 1000)

  if (bitrateKbps < 100) {
    throw new Error('Target size is too small for this video.')
  }

  return {
    bitrateKbps,
    audioBitrateKbps
  }
}