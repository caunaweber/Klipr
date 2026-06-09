import { CompressionOptions } from '../../types/compression'
import { createRequire } from 'node:module'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'node:path'
import { calculateVideoBitrate } from '../../utils/bitrate.utils'
import { attachProgressListener, captureStderr } from '../../utils/ffmpeg.utils'
import { calculateResolution } from '../../utils/resolution.utils'
import { buildOutputPath } from '../../utils/file.utils'
import { registerFfmpegProcess } from '../../utils/process-registry.utils'


const require = createRequire(import.meta.url)
const ffmpeg = require('ffmpeg-static')


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

    const trimArgs = isTrimmed
        ? ['-ss', String(start), '-t', String(clipDuration)]
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

        const pass1Process = spawn(ffmpeg, [
            '-y',

            ...trimArgs,

            '-i',
            filePath,

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

        const unregisterPass1Process =
            registerFfmpegProcess(pass1Process)

        let finished = false

        pass1Process.on(
            'error',
            (error) => {

                if (finished) return

                finished = true
                unregisterPass1Process()

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
            (code) => {

                if (finished) return

                finished = true
                unregisterPass1Process()

                if (code === 0) {
                    onProgress(50)
                    resolve()
                } else {
                    cleanupPassLogs(passLogFile)

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

        const ffmpegProcess = spawn(ffmpeg, [
            '-y',

            ...trimArgs,

            '-i',
            filePath,

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

                cleanupPassLogs(passLogFile)

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

        ffmpegProcess.on('close', (code) => {

            if (finished) return

            finished = true
            unregisterFfmpegProcess()

            console.log(
                `FFmpeg closed with code ${code}`
            )

            cleanupPassLogs(passLogFile)

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

function cleanupPassLogs(
    passLogFile: string
) {
    try {
        fs.unlinkSync(
            `${passLogFile}-0.log`
        )
    } catch { }

    try {
        fs.unlinkSync(
            `${passLogFile}-0.log.mbtree`
        )
    } catch { }
}

