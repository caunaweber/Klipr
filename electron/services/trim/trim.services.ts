import { createRequire } from 'node:module'
import { spawn } from 'child_process'
import type { TrimOptions } from '../../types/trim'
import { attachProgressListener, captureStderr } from '../../utils/ffmpeg.utils'
import { buildTrimOutputPath, removeFileIfExists } from '../../utils/file.utils'
import { createFfmpegCancelledError, registerFfmpegProcess } from '../../utils/process-registry.utils'
import { resolvePackagedBinaryPath } from '../../utils/binary-path.utils'

const require = createRequire(import.meta.url)
const ffmpeg = require('ffmpeg-static')
const ffmpegPath = resolvePackagedBinaryPath(ffmpeg)
const SEEK_PREROLL_SECONDS = 2

export async function trimVideo(options: TrimOptions): Promise<string> {

    const {
        filePath,
        startTime,
        endTime,
        onProgress
    } = options

    const clipDuration = endTime - startTime

    if (clipDuration <= 0) {
        throw new Error('Invalid clip duration')
    }

    const outputPath = buildTrimOutputPath(filePath, startTime, endTime)

    const preSeekTime =
        Math.max(
            0,
            startTime - SEEK_PREROLL_SECONDS
        )
    const fineSeekTime =
        startTime - preSeekTime

    return new Promise((resolve, reject) => {

        const ffmpegProcess = spawn(
            ffmpegPath,
            [
                '-y',

                '-ss',
                String(preSeekTime),

                '-i',
                filePath,

                '-ss',
                String(fineSeekTime),

                '-t',
                String(clipDuration),

                '-c:v',
                'libx264',

                '-preset',
                'veryfast',

                '-crf',
                '18',

                '-c:a',
                'aac',

                '-b:a',
                '160k',

                '-progress',
                'pipe:1',

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
                `FFmpeg trim closed with code ${code}`
            )

            if (code === 0 && !signal && !ffmpegControl.isCancelled()) {

                console.log(
                    'Trim finished'
                )

                onProgress(100)

                resolve(outputPath)

            } else {
                const wasCancelled =
                    ffmpegControl.isCancelled() ||
                    signal !== null

                await removeFileIfExists(outputPath)

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
