import type { CompressionCodec } from './compression'

export type EncoderTechnology =
    | 'cpu'
    | 'nvenc'
    | 'amf'

export type EncoderId =
    | 'cpu-h264'
    | 'cpu-h265'
    | 'nvenc-h264'
    | 'nvenc-h265'
    | 'amf-h264'
    | 'amf-h265'

export interface EncoderCapability {
    id: EncoderId
    technology: EncoderTechnology
    codec: CompressionCodec
    label: string
    description: string
}

export interface EncoderCapabilities {
    encoders: EncoderCapability[]
}