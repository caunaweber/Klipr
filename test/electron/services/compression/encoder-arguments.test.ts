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

    it('rejects GPU encoders until their arguments are implemented', () => {
        const encoder =
            getEncoderDefinition('nvenc-h264')

        expect(() =>
            buildEncoderArguments(
                encoder,
                1500,
            )
        ).toThrow(
            'GPU encoder arguments are not implemented yet'
        )
    })
})