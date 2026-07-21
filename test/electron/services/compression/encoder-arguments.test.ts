import {
    describe,
    expect,
    it,
} from 'vitest'
import {
    buildEncoderArguments,
} from '../../../../electron/services/compression/encoder-arguments'
import {
    getEncoderDefinition,
} from '../../../../electron/utils/encoder.utils'

describe('buildEncoderArguments', () => {
    it('builds libx264 arguments', () => {
        const encoder =
            getEncoderDefinition('cpu-h264')

        expect(
            buildEncoderArguments(
                encoder,
                1500,
            )
        ).toEqual([
            '-c:v',
            'libx264',
            '-preset',
            'slow',
            '-b:v',
            '1500k',
        ])
    })

    it('builds libx265 arguments', () => {
        const encoder =
            getEncoderDefinition('cpu-h265')

        expect(
            buildEncoderArguments(
                encoder,
                2000,
            )
        ).toEqual([
            '-c:v',
            'libx265',
            '-preset',
            'slow',
            '-b:v',
            '2000k',
        ])
    })

    it('builds H.264 NVENC arguments', () => {
        const encoder =
            getEncoderDefinition('nvenc-h264')

        expect(
            buildEncoderArguments(
                encoder,
                3000,
            )
        ).toEqual([
            '-c:v',
            'h264_nvenc',
            '-preset',
            'p5',
            '-tune',
            'hq',
            '-rc',
            'vbr',
            '-b:v',
            '3000k',
            '-pix_fmt',
            'yuv420p',
        ])
    })

    it('builds HEVC NVENC arguments', () => {
        const encoder =
            getEncoderDefinition('nvenc-h265')

        expect(
            buildEncoderArguments(
                encoder,
                2500,
            )
        ).toEqual([
            '-c:v',
            'hevc_nvenc',
            '-preset',
            'p5',
            '-tune',
            'hq',
            '-rc',
            'vbr',
            '-b:v',
            '2500k',
            '-pix_fmt',
            'yuv420p',
        ])
    })

    it('rejects AMF until its arguments are implemented', () => {
        const encoder =
            getEncoderDefinition('amf-h264')

        expect(() =>
            buildEncoderArguments(
                encoder,
                1500,
            )
        ).toThrow(
            'AMD AMF encoder arguments are not implemented yet'
        )
    })
})