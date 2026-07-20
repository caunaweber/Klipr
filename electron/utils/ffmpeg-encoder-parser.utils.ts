import {
    getEncoderDefinitions,
    type FfmpegEncoderName,
} from './encoder.utils'

const FFMPEG_ENCODER_LINE_PATTERN =
    /^\s*[A-Z.]{6}\s+(\S+)/

const KNOWN_ENCODER_NAMES = new Set<string>(
    getEncoderDefinitions().map(
        (definition) => definition.ffmpegName
    )
)

function isKnownEncoderName(value: string): value is FfmpegEncoderName {
    return KNOWN_ENCODER_NAMES.has(value)
}

export function parseListedFfmpegEncoders(output: string): Set<FfmpegEncoderName> {
    const listedEncoders =
        new Set<FfmpegEncoderName>()

    for (const line of output.split(/\r?\n/)) {
        const match =
            line.match(FFMPEG_ENCODER_LINE_PATTERN)

        if (!match) {
            continue
        }

        const encoderName = match[1]

        if (isKnownEncoderName(encoderName)) {
            listedEncoders.add(encoderName)
        }
    }

    return listedEncoders
}