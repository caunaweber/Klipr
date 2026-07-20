import type {
    EncoderCapability,
    EncoderId,
    EncoderTechnology,
} from '../types/encoder'
import type { CompressionCodec } from '../types/compression'

export type FfmpegEncoderName =
    | 'libx264'
    | 'libx265'
    | 'h264_nvenc'
    | 'hevc_nvenc'
    | 'h264_amf'
    | 'hevc_amf'

export interface EncoderDefinition {
    id: EncoderId
    technology: EncoderTechnology
    codec: CompressionCodec
    ffmpegName: FfmpegEncoderName
    label: string
    description: string
}

const ENCODER_DEFINITIONS: readonly EncoderDefinition[] = [
    {
        id: 'cpu-h264',
        technology: 'cpu',
        codec: 'h264',
        ffmpegName: 'libx264',
        label: 'AVC (H.264)',
        description: 'Software encoding with CPU',
    },
    {
        id: 'cpu-h265',
        technology: 'cpu',
        codec: 'h265',
        ffmpegName: 'libx265',
        label: 'HEVC (H.265)',
        description: 'Software encoding with CPU',
    },
    {
        id: 'nvenc-h264',
        technology: 'nvenc',
        codec: 'h264',
        ffmpegName: 'h264_nvenc',
        label: 'AVC (H.264) — NVIDIA NVENC',
        description: 'Hardware encoding with NVIDIA GPU',
    },
    {
        id: 'nvenc-h265',
        technology: 'nvenc',
        codec: 'h265',
        ffmpegName: 'hevc_nvenc',
        label: 'HEVC (H.265) — NVIDIA NVENC',
        description: 'Hardware encoding with NVIDIA GPU',
    },
    {
        id: 'amf-h264',
        technology: 'amf',
        codec: 'h264',
        ffmpegName: 'h264_amf',
        label: 'AVC (H.264) — AMD AMF',
        description: 'Hardware encoding with AMD GPU',
    },
    {
        id: 'amf-h265',
        technology: 'amf',
        codec: 'h265',
        ffmpegName: 'hevc_amf',
        label: 'HEVC (H.265) — AMD AMF',
        description: 'Hardware encoding with AMD GPU',
    },
]

export function getEncoderDefinitions() {
    return ENCODER_DEFINITIONS
}

export function getEncoderDefinition(
    encoderId: EncoderId
): EncoderDefinition {
    const definition = ENCODER_DEFINITIONS.find(
        (candidate) => candidate.id === encoderId
    )

    if (!definition) {
        throw new Error(`Unknown encoder: ${encoderId}`)
    }

    return definition
}

export function toEncoderCapability(
    definition: EncoderDefinition
): EncoderCapability {
    return {
        id: definition.id,
        technology: definition.technology,
        codec: definition.codec,
        label: definition.label,
        description: definition.description,
    }
}