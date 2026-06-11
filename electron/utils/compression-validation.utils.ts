import type { CompressionCodec } from '../types/compression'

export interface CompressionValidationInput {
  codec: CompressionCodec
  targetSizeMB: number
  sourceSizeMB: number
  duration: number
  startTime: number
  endTime: number
  width: number
  height: number
}

export function validateCompressionParameters(
  input: CompressionValidationInput
) {
  const errors: string[] = []

  if (!isSupportedCompressionCodec(input.codec)) {
    errors.push('codec must be h264 or h265')
  }

  if (!Number.isFinite(input.targetSizeMB) || input.targetSizeMB <= 0) {
    errors.push('targetSizeMB must be greater than 0')
  }

  if (
    Number.isFinite(input.targetSizeMB) &&
    Number.isFinite(input.sourceSizeMB) &&
    input.targetSizeMB >= input.sourceSizeMB
  ) {
    errors.push('targetSizeMB must be smaller than the source file size')
  }

  if (!Number.isFinite(input.duration) || input.duration <= 0) {
    errors.push('duration must be greater than 0')
  }

  if (!Number.isFinite(input.startTime) || input.startTime < 0) {
    errors.push('startTime must be greater than or equal to 0')
  }

  if (!Number.isFinite(input.endTime) || input.endTime <= input.startTime) {
    errors.push('endTime must be greater than startTime')
  }

  if (
    Number.isFinite(input.endTime) &&
    Number.isFinite(input.duration) &&
    input.endTime > input.duration
  ) {
    errors.push('endTime must be smaller than or equal to duration')
  }

  if (!Number.isFinite(input.width) || input.width <= 0) {
    errors.push('width must be greater than 0')
  }

  if (!Number.isFinite(input.height) || input.height <= 0) {
    errors.push('height must be greater than 0')
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid compression parameters: ${errors.join('; ')}`
    )
  }
}

function isSupportedCompressionCodec(
  codec: CompressionCodec
) {
  return codec === 'h264' || codec === 'h265'
}