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

export function captureStderr(
    process: ChildProcessWithoutNullStreams
) {
    let stderrOutput = ''

    process.stderr.on(
        'data',
        (data) => {
            stderrOutput += data.toString()
        }
    )

    return () => stderrOutput
}