import type { ChildProcessWithoutNullStreams } from 'node:child_process'

const activeFfmpegProcesses =
  new Set<ChildProcessWithoutNullStreams>()

const PROCESS_TERMINATION_TIMEOUT_MS = 3000

export function registerFfmpegProcess(
  process: ChildProcessWithoutNullStreams
) {
  activeFfmpegProcesses.add(process)

  const cleanup = () => {
    activeFfmpegProcesses.delete(process)
  }

  process.once('exit', cleanup)
  process.once('close', cleanup)
  process.once('error', cleanup)

  return () => {
    cleanup()
    process.removeListener('exit', cleanup)
    process.removeListener('close', cleanup)
    process.removeListener('error', cleanup)
  }
}

export async function terminateAllFfmpegProcesses() {
  const processes =
    Array.from(activeFfmpegProcesses)

  await Promise.allSettled(
    processes.map((process) =>
      terminateFfmpegProcess(
        process,
        PROCESS_TERMINATION_TIMEOUT_MS
      )
    )
  )
}

async function terminateFfmpegProcess(
  process: ChildProcessWithoutNullStreams,
  timeoutMs: number
) {
  if (
    process.exitCode !== null ||
    process.signalCode !== null
  ) {
    activeFfmpegProcesses.delete(process)
    return
  }

  await new Promise<void>((resolve) => {
    let settled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const cleanup = () => {
      if (settled) {
        return
      }

      settled = true

      if (timer) {
        clearTimeout(timer)
      }

      process.removeListener('exit', cleanup)
      process.removeListener('close', cleanup)
      process.removeListener('error', cleanup)
      activeFfmpegProcesses.delete(process)
      resolve()
    }

    timer = setTimeout(cleanup, timeoutMs)

    process.once('exit', cleanup)
    process.once('close', cleanup)
    process.once('error', cleanup)

    try {
      process.kill()
    } catch {
      cleanup()
    }
  })
}
