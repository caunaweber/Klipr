import { execFile } from 'node:child_process'
import { createRequire } from 'node:module'
import { promisify } from 'node:util'
import type { FfmpegEncoderName, } from '../../utils/encoder.utils'
import { parseListedFfmpegEncoders, } from '../../utils/ffmpeg-encoder-parser.utils'
import { resolvePackagedBinaryPath, } from '../../utils/binary-path.utils'

const require = createRequire(import.meta.url)
const execFileAsync = promisify(execFile)

const ffmpeg = require('ffmpeg-static')
const ffmpegPath = resolvePackagedBinaryPath(ffmpeg)

export async function listFfmpegEncoders(): Promise<Set<FfmpegEncoderName>> {
    const { stdout } = await execFileAsync(
        ffmpegPath,
        [
            '-hide_banner',
            '-encoders',
        ],
        {
            windowsHide: true,
            maxBuffer: 1024 * 1024,
        }
    )

    return parseListedFfmpegEncoders(stdout)
}