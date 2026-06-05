export function calculateVideoBitrate(targetSizeMB: number, duration: number, audioBitrateKbps = 128): {bitrateKbps: number, audioBitrateKbps: number} {

  const audioBits = audioBitrateKbps * 1000 * duration
  const targetBits = targetSizeMB * 1024 * 1024 * 8
  const videoBits = targetBits - audioBits
  const videoBitrate = Math.floor(videoBits / duration)
  const bitrateKbps = Math.floor(videoBitrate / 1000)

  if (bitrateKbps < 100) {
    throw new Error(
      'Target size is too small for this video.'
    )
  }

  return {
    bitrateKbps,
    audioBitrateKbps
  }
}