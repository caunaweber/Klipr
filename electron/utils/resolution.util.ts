import { Resolution } from "../types/resolution"

export function calculateResolution(
  width: number,
  height: number,
  bitrateKbps: number
): Resolution {

  if (bitrateKbps < 700 && height > 480) {
    return {
      width: 854,
      height: 480
    }
  }

  if (bitrateKbps < 2000 && height > 720) {
    return {
      width: 1280,
      height: 720
    }
  }

  return {
    width,
    height
  }
}