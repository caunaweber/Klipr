import { Resolution } from "../types/resolution"

export function calculateResolution(
  width: number,
  height: number,
  bitrateKbps: number
): Resolution {

  const maxLongEdge =
    getMaxLongEdge(
      height,
      bitrateKbps
    )

  if (!maxLongEdge) {
    return {
      width: makeEven(width),
      height: makeEven(height)
    }
  }

  const longEdge =
    Math.max(
      width,
      height
    )

  if (longEdge <= maxLongEdge) {
    return {
      width: makeEven(width),
      height: makeEven(height)
    }
  }

  const scale =
    maxLongEdge / longEdge

  return {
    width: makeEven(
      Math.round(width * scale)
    ),
    height: makeEven(
      Math.round(height * scale)
    )
  }
}

function getMaxLongEdge(
  height: number,
  bitrateKbps: number
) {
  if (bitrateKbps < 700 && height > 480) {
    return 854
  }

  if (bitrateKbps < 2000 && height > 720) {
    return 1280
  }

  return null
}

function makeEven(
  value: number
) {
  return Math.max(
    2,
    Math.round(value / 2) * 2
  )
}
