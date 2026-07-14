import { CompressionOptions } from '../../types/compression'
import { createRequire } from 'node:module'
import { spawn } from 'child_process'
import { calculateVideoBitrate } from '../../utils/bitrate.utils'
import { attachProgressListener, captureStderr } from '../../utils/ffmpeg.utils'
import { calculateResolution } from '../../utils/resolution.utils'
import { buildOutputPath, removeFileIfExists } from '../../utils/file.utils'
import { createFfmpegCancelledError, registerFfmpegProcess } from '../../utils/process-registry.utils'
import { resolvePackagedBinaryPath } from '../../utils/binary-path.utils'

const require = createRequire(import.meta.url)
const ffmpeg = require('ffmpeg-static')
const ffmpegPath = resolvePackagedBinaryPath(ffmpeg)

export async function onePassCompression(options: CompressionOptions): Promise<string> {

    const {
        filePath,
        targetSizeMB,
        duration,
        onProgress,
        width,
        height,
        codec,
        fps,
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

    const seekArgs = start > 0
        ? ['-ss', String(start)]
        : []

    const durationArgs = isTrimmed
        ? ['-t', String(clipDuration)]
        : []

    const { bitrateKbps, audioBitrateKbps } = calculateVideoBitrate(targetSizeMB, clipDuration)

    const resolution = calculateResolution(width, height, bitrateKbps)

    const outputPath = buildOutputPath(filePath, codec, targetSizeMB, false, fps)

    const encoder = codec === 'h265' ? 'libx265' : 'libx264'
    const videoFilter = fps === 'native'
        ? `scale=${resolution.width}:${resolution.height}`
        : `scale=${resolution.width}:${resolution.height},fps=${fps}`

    return new Promise((resolve, reject) => {

        const ffmpegProcess = spawn(
            ffmpegPath,
            [
                '-y',

                ...seekArgs,

                '-i',
                filePath,

                ...durationArgs,

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
                videoFilter,

                '-progress',
                'pipe:1',

                outputPath
            ]
        )

        const ffmpegControl =
            registerFfmpegProcess(ffmpegProcess)

        console.log('FFmpeg process created')

        let finished = false

        ffmpegProcess.on(
            'error',
            (error) => {

                if (finished) return

                finished = true
                ffmpegControl.unregister()

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

        ffmpegProcess.on('close', async (code, signal) => {

            if (finished) return

            finished = true
            ffmpegControl.unregister()

            console.log(
                `FFmpeg closed with code ${code}`
            )

            if (code === 0 && !signal && !ffmpegControl.isCancelled()) {

                console.log(
                    'Compression finished'
                )

                onProgress(100)

                resolve(outputPath)

            } else {
                const wasCancelled =
                    ffmpegControl.isCancelled() ||
                    signal !== null

                if (wasCancelled) {
                    await removeFileIfExists(outputPath)
                    reject(createFfmpegCancelledError())
                    return
                }

                await removeFileIfExists(outputPath)

                reject(
                    new Error(
                        `FFmpeg exited with code ${code}\n${getStderr()}`
                    )
                )
            }
        })
    })
}
