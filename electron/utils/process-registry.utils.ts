import type { ChildProcessWithoutNullStreams } from 'node:child_process'

export interface FfmpegProcessControl {
  process: ChildProcessWithoutNullStreams
  cancel: () => void
  isCancelled: () => boolean
  stopped: Promise<void>
  unregister: () => void
}

const activeFfmpegProcesses =
  new Set<FfmpegProcessControl>()

const PROCESS_TERMINATION_TIMEOUT_MS = 3000

export function registerFfmpegProcess(
  process: ChildProcessWithoutNullStreams
) : FfmpegProcessControl {
  let cancelled = false
  let disposed = false

  let resolveStopped!: () => void
  const stopped = new Promise<void>((resolve) => {
    resolveStopped = resolve
  })

  const cleanup = () => {
    if (disposed) {
      return
    }

    disposed = true
    activeFfmpegProcesses.delete(control)
    process.removeListener('exit', cleanup)
    process.removeListener('error', cleanup)
    resolveStopped()
  }

  const control: FfmpegProcessControl = {
    process,
    cancel: () => {
      cancelled = true

      try {
        process.kill()
      } catch {
        cleanup()
      }
    },
    isCancelled: () => cancelled,
    stopped,
    unregister: cleanup,
  }

  activeFfmpegProcesses.add(control)

  process.once('exit', cleanup)
  process.once('error', cleanup)

  return control
}

export async function terminateAllFfmpegProcesses() {
  const processes =
    Array.from(activeFfmpegProcesses)

  processes.forEach((control) => control.cancel())

  await Promise.allSettled(
    processes.map((control) =>
      terminateFfmpegProcess(
        control,
        PROCESS_TERMINATION_TIMEOUT_MS
      )
    )
  )
}

async function terminateFfmpegProcess(
  control: FfmpegProcessControl,
  timeoutMs: number
) {
  const { process } = control

  if (
    process.exitCode !== null ||
    process.signalCode !== null
  ) {
    control.unregister()
    return
  }

  await Promise.race([
    control.stopped,
    new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        control.unregister()
        resolve()
      }, timeoutMs)

      control.stopped.finally(() => {
        clearTimeout(timer)
        resolve()
      })
    })
  ])
}

export function createFfmpegCancelledError() {
  const error = new Error('FFmpeg operation cancelled')
  error.name = 'AbortError'
  return error
}
