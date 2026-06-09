import type { ChildProcessWithoutNullStreams } from 'child_process'

export function attachProgressListener(
    process: ChildProcessWithoutNullStreams,
    duration: number,
    onProgress: (progress: number) => void,
    startPercent: number,
    endPercent: number
) {
    process.stdout.on(
        'data',
        (data) => {

            const output =
                data.toString()

            const match =
                output.match(
                    /out_time_ms=(\d+)/
                )

            if (!match) return

            const currentSeconds =
                Number(match[1]) / 1000000

            const progress =
                Math.min(
                    endPercent,
                    startPercent +
                    Math.floor(
                        (currentSeconds / duration) *
                        (endPercent - startPercent)
                    )
                )

            onProgress(progress)
        }
    )
}

const MAX_STDERR_CHARS = 16_384

export function captureStderr(
    process: ChildProcessWithoutNullStreams
) {
    let stderrOutput = ''
    let truncated = false

    process.stderr.on(
        'data',
        (data) => {
            stderrOutput += data.toString()

            if (stderrOutput.length > MAX_STDERR_CHARS) {
                stderrOutput =
                    stderrOutput.slice(
                        -MAX_STDERR_CHARS
                    )
                truncated = true
            }
        }
    )

    return () =>
        truncated
            ? `... stderr truncated to last ${MAX_STDERR_CHARS} chars\n${stderrOutput}`
            : stderrOutput
}
