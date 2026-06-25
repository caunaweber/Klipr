import { CompressionOptions } from '../../types/compression'
import { createRequire } from 'node:module'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'node:path'
import { calculateVideoBitrate } from '../../utils/bitrate.utils'
import { attachProgressListener, captureStderr } from '../../utils/ffmpeg.utils'
import { calculateResolution } from '../../utils/resolution.utils'
import { buildOutputPath, removeFileIfExists } from '../../utils/file.utils'
import { createFfmpegCancelledError, registerFfmpegProcess } from '../../utils/process-registry.utils'
import { resolvePackagedBinaryPath } from '../../utils/binary-path.utils'


const require = createRequire(import.meta.url)
const ffmpeg = require('ffmpeg-static')
const ffmpegPath = resolvePackagedBinaryPath(ffmpeg)


export async function twoPassCompression(options: CompressionOptions): Promise<string> {

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

    const seekArgs = start > 0
        ? ['-ss', String(start)]
        : []

    const durationArgs = isTrimmed
        ? ['-t', String(clipDuration)]
        : []

    const { bitrateKbps, audioBitrateKbps } = calculateVideoBitrate(targetSizeMB, clipDuration)

    const resolution = calculateResolution(width, height, bitrateKbps)

    const outputPath = buildOutputPath(filePath, codec, targetSizeMB, true)

    const encoder = codec === 'h265' ? 'libx265' : 'libx264'

    const parsedFile = path.parse(filePath)
    const passLogFile = path.join(
        parsedFile.dir,
        `${parsedFile.name}-passlog`
    )

    console.log('Starting first pass...')

    cleanupPassLogs(passLogFile)

    await new Promise<void>((resolve, reject) => {

        const pass1Process = spawn(ffmpegPath, [
            '-y',

            ...seekArgs,

            '-i',
            filePath,

            ...durationArgs,

            '-fps_mode',
            'cfr',

            '-c:v',
            encoder,

            '-preset',
            'slow',

            '-b:v',
            `${bitrateKbps}k`,

            '-pass',
            '1',

            '-passlogfile',
            passLogFile,

            '-an',

            '-progress',
            'pipe:1',

            '-f',
            'null',

            process.platform === 'win32'
                ? 'NUL'
                : '/dev/null'
        ])

        const pass1Control =
            registerFfmpegProcess(pass1Process)

        let finished = false

        pass1Process.on(
            'error',
            (error) => {

                if (finished) return

                finished = true
                pass1Control.unregister()

                console.error(
                    'First pass process error:',
                    error
                )

                cleanupPassLogs(passLogFile)

                reject(error)
            }
        )

        const getStderr =
            captureStderr(pass1Process)

        attachProgressListener(
            pass1Process,
            clipDuration,
            onProgress,
            0,
            50
        )

        pass1Process.on(
            'close',
            async (code, signal) => {

                if (finished) return

                finished = true
                pass1Control.unregister()

                if (code === 0 && !signal && !pass1Control.isCancelled()) {
                    onProgress(50)
                    resolve()
                } else {
                    const wasCancelled =
                        pass1Control.isCancelled() ||
                        signal !== null

                    cleanupPassLogs(passLogFile)

                    if (wasCancelled) {
                        reject(createFfmpegCancelledError())
                        return
                    }

                    reject(
                        new Error(
                            `First pass failed with code ${code}\n${getStderr()}`
                        )
                    )
                }
            }
        )
    })

    return new Promise((resolve, reject) => {

        const ffmpegProcess = spawn(ffmpegPath, [
            '-y',

            ...seekArgs,

            '-i',
            filePath,

            ...durationArgs,

            '-fps_mode',
            'cfr',

            '-c:v',
            encoder,

            '-preset',
            'slow',

            '-b:v',
            `${bitrateKbps}k`,

            '-pass',
            '2',

            '-passlogfile',
            passLogFile,

            '-c:a',
            'aac',

            '-b:a',
            `${audioBitrateKbps}k`,

            '-vf',
            `scale=${resolution.width}:${resolution.height}`,

            '-progress',
            'pipe:1',

            outputPath
        ])

        const ffmpegControl =
            registerFfmpegProcess(ffmpegProcess)

        console.log('FFmpeg process created')

        let finished = false

        ffmpegProcess.on(
            'error',
            async (error) => {

                if (finished) return

                finished = true
                ffmpegControl.unregister()

                console.error(
                    'FFmpeg process error:',
                    error
                )

                cleanupPassLogs(passLogFile)
                await removeFileIfExists(outputPath)

                reject(error)
            }
        )

        const getStderr =
            captureStderr(ffmpegProcess)

        attachProgressListener(
            ffmpegProcess,
            clipDuration,
            onProgress,
            50,
            100
        )

        ffmpegProcess.on('close', async (code, signal) => {

            if (finished) return

            finished = true
            ffmpegControl.unregister()

            console.log(
                `FFmpeg closed with code ${code}`
            )

            cleanupPassLogs(passLogFile)

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

                await removeFileIfExists(outputPath)

                if (wasCancelled) {
                    reject(createFfmpegCancelledError())
                    return
                }

                reject(
                    new Error(
                        `FFmpeg exited with code ${code}\n${getStderr()}`
                    )
                )
            }
        })
    })
}

function cleanupPassLogs(
    passLogFile: string
) {
    try {
        fs.unlinkSync(
            `${passLogFile}-0.log`
        )
    } catch {
        // Pass logs are best-effort cleanup artifacts.
    }

    try {
        fs.unlinkSync(
            `${passLogFile}-0.log.mbtree`
        )
    } catch {
        // Pass logs are best-effort cleanup artifacts.
    }
}
