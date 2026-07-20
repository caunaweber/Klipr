import { execFile } from 'node:child_process'
import { createRequire } from 'node:module'
import { promisify } from 'node:util'
import type {
  FfmpegEncoderName,
} from '../../utils/encoder.utils'
import {
  resolvePackagedBinaryPath,
} from '../../utils/binary-path.utils'

const require = createRequire(import.meta.url)
const execFileAsync = promisify(execFile)

const ffmpeg = require('ffmpeg-static')
const ffmpegPath =
  resolvePackagedBinaryPath(ffmpeg)

const ENCODER_PROBE_TIMEOUT_MS = 10_000

export async function probeFfmpegEncoder(
  encoderName: FfmpegEncoderName
): Promise<boolean> {
  try {
    await execFileAsync(
      ffmpegPath,
      [
        '-hide_banner',
        '-loglevel',
        'error',

        '-nostdin',

        '-f',
        'lavfi',

        '-i',
        'color=color=black:size=640x360:rate=1',

        '-frames:v',
        '1',

        '-an',

        '-c:v',
        encoderName,

        '-b:v',
        '1M',

        '-pix_fmt',
        'yuv420p',

        '-f',
        'null',

        '-',
      ],
      {
        windowsHide: true,
        timeout: ENCODER_PROBE_TIMEOUT_MS,
        maxBuffer: 1024 * 1024,
      }
    )

    return true
  } catch {
    return false
  }
}