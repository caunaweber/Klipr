import { createRequire } from 'node:module'
import { spawn } from 'child_process'
import type { TrimOptions } from '../../types/trim'
import { captureStderr } from '../../utils/ffmpeg.utils'
import { buildTrimOutputPath, removeFileIfExistsBestEffort } from '../../utils/file.utils'
import { createFfmpegCancelledError, registerFfmpegProcess } from '../../utils/process-registry.utils'
import { resolvePackagedBinaryPath } from '../../utils/binary-path.utils'

const require = createRequire(import.meta.url)
const ffmpeg = require('ffmpeg-static')
const ffmpegPath = resolvePackagedBinaryPath(ffmpeg)

export async function trimVideo(options: TrimOptions): Promise<string> {

    const {
        filePath,
        startTime,
        endTime
    } = options

    const clipDuration = endTime - startTime

    if (clipDuration <= 0) {
        throw new Error('Invalid clip duration')
    }

    const outputPath = buildTrimOutputPath(filePath, startTime, endTime)

    return new Promise((resolve, reject) => {

        const ffmpegProcess = spawn(
            ffmpegPath,
            [
                '-y',

                '-ss',
                String(startTime),

                '-i',
                filePath,

                '-t',
                String(clipDuration),

                '-c',
                'copy',

                '-avoid_negative_ts',
                'make_zero',

                '-movflags',
                '+faststart',

                outputPath
            ]
        )

        const ffmpegControl =
            registerFfmpegProcess(ffmpegProcess)

        console.log('FFmpeg trim process created')

        let finished = false

        ffmpegProcess.on(
            'error',
            (error) => {

                if (finished) return

                finished = true
                ffmpegControl.unregister()

                console.error(
                    'FFmpeg trim process error:',
                    error
                )

                reject(error)
            }
        )

        const getStderr =
            captureStderr(ffmpegProcess)

        ffmpegProcess.on('close', async (code, signal) => {

            if (finished) return

            finished = true
            ffmpegControl.unregister()

            console.log(
                `FFmpeg trim closed with code ${code}`
            )

            if (code === 0 && !signal && !ffmpegControl.isCancelled()) {

                console.log(
                    'Trim finished'
                )

                resolve(outputPath)

            } else {
                const wasCancelled =
                    ffmpegControl.isCancelled() ||
                    signal !== null

                await removeFileIfExistsBestEffort(outputPath)

                if (wasCancelled) {
                    reject(createFfmpegCancelledError())
                    return
                }

                reject(
                    new Error(
                        `FFmpeg trim exited with code ${code}\n${getStderr()}`
                    )
                )
            }
        })
    })

}
