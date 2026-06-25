export interface TrimValidationInput {
  duration: number
  startTime: number
  endTime: number
}

export function validateTrimParameters(
  input: TrimValidationInput
) {

  const errors: string[] = []

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

  if (
    Number.isFinite(input.startTime) &&
    Number.isFinite(input.endTime) &&
    input.endTime - input.startTime < 1
  ) {
    errors.push('trim duration must be at least 1 second')
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid trim parameters: ${errors.join('; ')}`
    )
  }
}