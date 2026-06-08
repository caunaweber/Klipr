import { CompressionOptions } from '../../types/compression'
import { createRequire } from 'node:module'
import { spawn } from 'child_process'
import { calculateVideoBitrate } from '../../utils/bitrate.util'
import { attachProgressListener, captureStderr } from '../../utils/ffmpeg.utils'
import { calculateResolution } from '../../utils/resolution.util'
import { buildOutputPath } from '../../utils/file.utils'

const require = createRequire(import.meta.url)
const ffmpeg = require('ffmpeg-static')

export async function onePassCompression(
    options: CompressionOptions
): Promise<string> {

    const {
        filePath,
        targetSizeMB,
        duration,
        onProgress,
        width,
        height,
        codec
    } = options

    const {
        bitrateKbps,
        audioBitrateKbps
    } = calculateVideoBitrate(targetSizeMB, duration)

    const resolution = calculateResolution(width, height, bitrateKbps)

    const outputPath = buildOutputPath(filePath, codec, targetSizeMB, false)

    const encoder = codec === 'h265' ? 'libx265' : 'libx264'

    console.log({
        ffmpeg,
        filePath,
        targetSizeMB,
        bitrateKbps,
        outputPath
    })

    return new Promise((resolve, reject) => {

        const ffmpegProcess = spawn(
            ffmpeg,
            [
                '-y',
                '-i',
                filePath,

                '-preset',
                'slow',

                '-b:v',
                `${bitrateKbps}k`,

                '-c:v',
                encoder,

                '-c:a',
                'aac',

                '-b:a',
                `${audioBitrateKbps}k`,

                '-vf',
                `scale=${resolution.width}:${resolution.height}`,

                '-progress',
                'pipe:1',

                outputPath
            ]
        )

        console.log('FFmpeg process created')

        let finished = false

        ffmpegProcess.on(
            'error',
            (error) => {

                if (finished) return

                finished = true

                console.error(
                    'FFmpeg process error:',
                    error
                )

                reject(error)
            }
        )

        const getStderr =
            captureStderr(ffmpegProcess)

        attachProgressListener(
            ffmpegProcess,
            duration,
            onProgress,
            0,
            100
        )

        ffmpegProcess.on('close', (code) => {

            if (finished) return

            finished = true

            console.log(
                `FFmpeg closed with code ${code}`
            )

            if (code === 0) {

                console.log(
                    'Compression finished'
                )

                onProgress(100)

                resolve(outputPath)

            } else {

                reject(
                    new Error(
                        `FFmpeg exited with code ${code}\n${getStderr()}`
                    )
                )
            }
        })
    })
}