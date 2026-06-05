import { CompressionOptions } from '../../types/compression'
import { createRequire } from 'node:module'
import { spawn } from 'child_process'
import path from 'node:path'
import { calculateVideoBitrate } from '../../utils/bitrate.util'


const require = createRequire(import.meta.url)
const ffmpeg = require('ffmpeg-static')

export async function onePassCompression(
    options: CompressionOptions
): Promise<string> {

    const {
        filePath,
        targetSizeMB,
        duration,
        onProgress
    } = options

    const {
        bitrateKbps,
        audioBitrateKbps
    } = calculateVideoBitrate(
        targetSizeMB,
        duration
    )

    const parsedFile = path.parse(filePath)

    const outputPath = path.join(
        parsedFile.dir,
        `${parsedFile.name}-compressed.mp4`
    )

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

                '-b:v',
                `${bitrateKbps}k`,

                '-c:v',
                'libx264',

                '-c:a',
                'aac',

                '-b:a',
                `${audioBitrateKbps}k`,

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

        let stderrOutput = ''

        ffmpegProcess.stderr.on(
            'data',
            (data) => {
                stderrOutput += data.toString()
            }
        )

        ffmpegProcess.stdout.on('data', (data) => {
            const output = data.toString()

            const match =
                output.match(
                    /out_time_ms=(\d+)/
                )

            if (match) {

                const currentSeconds =
                    Number(match[1]) / 1000000

                const progress =
                    Math.min(
                        100,
                        Math.floor(
                            (currentSeconds / duration) * 100
                        )
                    )

                // console.log(
                //     `Progress: ${progress}%`
                // )

                onProgress(progress)
            }
        })

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
                        `FFmpeg exited with code ${code}\n${stderrOutput}`
                    )
                )
            }
        })
    })
}