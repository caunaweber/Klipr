import { CompressionOptions } from '../../types/compression'
import { createRequire } from 'node:module'
import { execFile, spawn } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'node:path'
import { calculateVideoBitrate } from '../../utils/bitrate.util'

const execFileAsync = promisify(execFile)

const require = createRequire(import.meta.url)
const ffmpeg = require('ffmpeg-static')


export async function twoPassCompression(options: CompressionOptions): Promise<string> {

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

    const passLogFile = path.join(
        parsedFile.dir,
        `${parsedFile.name}-passlog`
    )

    console.log({
        ffmpeg,
        filePath,
        targetSizeMB,
        bitrateKbps,
        outputPath
    })

    console.log('Starting first pass...')

    cleanupPassLogs(passLogFile)

    try {
        await execFileAsync(ffmpeg, [
            '-y',
            '-i',
            filePath,

            '-fps_mode',
            'cfr',

            '-c:v',
            'libx264',

            '-b:v',
            `${bitrateKbps}k`,

            '-pass',
            '1',

            '-passlogfile',
            passLogFile,

            '-an',

            '-f',
            'null',

            process.platform === 'win32'
                ? 'NUL'
                : '/dev/null'
        ])
    } catch (error) {
        cleanupPassLogs(passLogFile)
        throw error
    }

    console.log('First pass finished')

    return new Promise((resolve, reject) => {

        const ffmpegProcess = spawn(ffmpeg, [
            '-y',
            '-i',
            filePath,

            '-fps_mode',
            'cfr',

            '-c:v',
            'libx264',

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

            '-progress',
            'pipe:1',

            outputPath
        ])

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

                cleanupPassLogs(passLogFile)

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
                        `FFmpeg exited with code ${code}\n${stderrOutput}`
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