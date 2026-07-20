import type { EncoderCapabilities, } from '../../types/encoder'
import { getEncoderDefinitions, toEncoderCapability, } from '../../utils/encoder.utils'
import { listFfmpegEncoders, } from './encoder-listing.services'
import { probeFfmpegEncoder, } from './encoder-probe.services'

let encoderCapabilitiesPromise: Promise<EncoderCapabilities> | null = null

async function detectEncoderCapabilities(): Promise<EncoderCapabilities> {

    const definitions = getEncoderDefinitions()

    const cpuCapabilities = definitions
        .filter((definition) => definition.technology === 'cpu')
        .map(toEncoderCapability)

    try {
        const listedEncoders = await listFfmpegEncoders()

        const eligibleGpuDefinitions = definitions
            .filter((definition) =>
                definition.technology !== 'cpu' &&
                listedEncoders.has(definition.ffmpegName)
            )

        const probeResults = await Promise.all(
            eligibleGpuDefinitions.map(async (definition) => ({
                definition,
                isAvailable: await probeFfmpegEncoder(definition.ffmpegName),
            }))
        )

        const availableGpuCapabilities = probeResults
            .filter((result) => result.isAvailable)
            .map((result) => toEncoderCapability(result.definition))

        return {
            encoders: [
                ...cpuCapabilities,
                ...availableGpuCapabilities,
            ],
        }
    } catch (error) {
        console.error('Encoder detection failed:', error)

        return { encoders: cpuCapabilities, }
    }
}

export function getEncoderCapabilities(): Promise<EncoderCapabilities> {
    if (!encoderCapabilitiesPromise) {
        encoderCapabilitiesPromise = detectEncoderCapabilities()
    }

    return encoderCapabilitiesPromise
}
