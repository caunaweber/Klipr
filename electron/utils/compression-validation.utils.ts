export interface CompressionValidationInput {
  targetSizeMB: number
  startTime: number
  endTime: number
  width: number
  height: number
}

export function validateCompressionParameters(
  input: CompressionValidationInput
) {
  const errors: string[] = []

  if (!Number.isFinite(input.targetSizeMB) || input.targetSizeMB <= 0) {
    errors.push('targetSizeMB must be greater than 0')
  }

  if (!Number.isFinite(input.startTime) || input.startTime < 0) {
    errors.push('startTime must be greater than or equal to 0')
  }

  if (!Number.isFinite(input.endTime) || input.endTime <= input.startTime) {
    errors.push('endTime must be greater than startTime')
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
