import { CompressionOptions } from '../../types/compression'
import { createRequire } from 'node:module'
import { spawn } from 'child_process'
import { calculateVideoBitrate } from '../../utils/bitrate.utils'
import { attachProgressListener, captureStderr } from '../../utils/ffmpeg.utils'
import { calculateResolution } from '../../utils/resolution.utils'
import { buildOutputPath } from '../../utils/file.utils'
import { registerFfmpegProcess } from '../../utils/process-registry.utils'

const require = createRequire(import.meta.url)
const ffmpeg = require('ffmpeg-static')

export async function onePassCompression(options: CompressionOptions): Promise<string> {

    const {
        filePath,
        targetSizeMB,
        duration,
        onProgress,
        width,
        height,
        codec,
        startTime,
        endTime
    } = options

    const start = startTime ?? 0
    const end = endTime ?? duration

    const clipDuration = end - start

    if (clipDuration <= 0) {
        throw new Error('Invalid clip duration')
    }

    const isTrimmed =
        start > 0 || end < duration

    const trimArgs = isTrimmed
        ? ['-ss', String(start), '-t', String(clipDuration)]
        : []

    const { bitrateKbps, audioBitrateKbps } = calculateVideoBitrate(targetSizeMB, clipDuration)

    const resolution = calculateResolution(width, height, bitrateKbps)

    const outputPath = buildOutputPath(filePath, codec, targetSizeMB, false)

    const encoder = codec === 'h265' ? 'libx265' : 'libx264'

    return new Promise((resolve, reject) => {

        const ffmpegProcess = spawn(
            ffmpeg,
            [
                '-y',

                ...trimArgs,

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

        const unregisterFfmpegProcess =
            registerFfmpegProcess(ffmpegProcess)

        console.log('FFmpeg process created')

        let finished = false

        ffmpegProcess.on(
            'error',
            (error) => {

                if (finished) return

                finished = true
                unregisterFfmpegProcess()

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
            clipDuration,
            onProgress,
            0,
            100
        )

        ffmpegProcess.on('close', (code) => {

            if (finished) return

            finished = true
            unregisterFfmpegProcess()

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
