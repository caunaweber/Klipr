import { app, BrowserWindow, ipcMain, shell, Notification } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { selectVideo, selectDroppedVideo, compressVideo, trimSelectedVideo } from './services/video.services'
import { CompressionRequest } from './types/compression'
import { TrimRequest } from './types/trim'
import { protocol } from 'electron'
import fs from 'node:fs'
import { terminateAllFfmpegProcesses } from './utils/process-registry.utils'
import { getSelectedVideoPath } from './utils/selected-video-registry.utils'
import { getGeneratedOutputPath } from './utils/generated-output-registry.utils'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'video',
    privileges: {
      secure: true,
      standard: true,
      stream: true,
      supportFetchAPI: true,
    },
  },
])

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let isShuttingDown = false
let isVideoOperationActive = false

interface ParsedRange {
  start: number
  end: number
}

function createVideoStreamBody(
  filePath: string,
  options?: {
    start: number
    end: number
  }
): ReadableStream<Uint8Array> {
  const fileStream =
    fs.createReadStream(
      filePath,
      options
    )

  let controller:
    | ReadableStreamDefaultController<Uint8Array>
    | null = null
  let isSettled = false

  const cleanup = () => {
    fileStream.off('data', handleData)
    fileStream.off('end', handleEnd)
    fileStream.off('error', handleError)
  }

  const settle = (
    action: () => void
  ) => {
    if (isSettled) {
      return
    }

    isSettled = true
    cleanup()
    action()
  }

  const handleData = (
    chunk: string | Buffer
  ) => {
    if (
      isSettled ||
      !controller
    ) {
      return
    }

    try {
      controller.enqueue(
        typeof chunk === 'string'
          ? Buffer.from(chunk)
          : chunk
      )
    } catch {
      settle(() => {
        fileStream.destroy()
      })
    }
  }

  const handleEnd = () => {
    settle(() => {
      controller?.close()
    })
  }

  const handleError = (
    error: Error
  ) => {
    settle(() => {
      controller?.error(error)
    })
  }

  fileStream.on('data', handleData)
  fileStream.once('end', handleEnd)
  fileStream.once('error', handleError)

  return new ReadableStream<Uint8Array>({
    start(streamController) {
      controller = streamController
    },
    cancel() {
      settle(() => {
        fileStream.destroy()
      })
    },
  })
}

function parseRangeHeader(
  range: string,
  fileSize: number
): ParsedRange | null {
  const match = range.match(/^bytes=(\d+)-(\d*)$/)

  if (!match) {
    return null
  }

  const start = Number(match[1])
  const end = match[2]
    ? Number(match[2])
    : fileSize - 1

  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    end < start ||
    start >= fileSize ||
    end >= fileSize
  ) {
    return null
  }

  return {
    start,
    end
  }
}

function getVideoContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase()

  if (extension === '.mp4') {
    return 'video/mp4'
  }

  if (extension === '.mkv') {
    return 'video/x-matroska'
  }

  if (extension === '.avi') {
    return 'video/x-msvideo'
  }

  return 'application/octet-stream'
}

function getVideoIdFromRequestUrl(requestUrl: string) {
  const url = new URL(requestUrl)

  if (url.hostname === 'local') {
    return decodeURIComponent(
      url.pathname.replace(/^\/+/, '')
    )
  }

  return decodeURIComponent(
    url.hostname || requestUrl.slice('video://'.length)
  ).replace(/\/+$/, '')
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 720,
    minWidth: 760,
    minHeight: 640,
    autoHideMenuBar: true,
    frame: false,
    backgroundColor: '#061116',
    icon: path.join(process.env.APP_ROOT, 'build/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  win.setMenuBarVisibility(false)
  win.removeMenu()

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', (event) => {
  if (isShuttingDown) {
    return
  }

  event.preventDefault()
  isShuttingDown = true

  void (async () => {
    await terminateAllFfmpegProcesses()
    app.quit()
  })()
})

ipcMain.handle('select-video', selectVideo)

ipcMain.handle('select-dropped-video', async (_, filePath: unknown) =>
  selectDroppedVideo(filePath)
)

ipcMain.handle('compress-video', async (_, request: CompressionRequest) => {

  if (isVideoOperationActive) {
    throw new Error('A video operation is already active')
  }

  isVideoOperationActive = true

  try {
    return await compressVideo(
      request,
      (progress) => {
        if (win && !win.isDestroyed()) {
          win.webContents.send(
            'video-operation-progress',
            progress
          )
        }
      }
    )
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    isVideoOperationActive = false
  }
})

ipcMain.handle('trim-video', async (_, request: TrimRequest) => {

  if (isVideoOperationActive) {
    throw new Error('A video operation is already active')
  }

  isVideoOperationActive = true

  try {
    return await trimSelectedVideo(request)
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    isVideoOperationActive = false
  }
})

ipcMain.handle('cancel-video-operation', async () => {
  await terminateAllFfmpegProcesses()
})

ipcMain.handle('open-result-folder', async (_, outputId: string) => {
  const outputPath = getGeneratedOutputPath(outputId)

  if (!outputPath) {
    throw new Error('Output file not authorized')
  }

  shell.showItemInFolder(outputPath)
})

ipcMain.handle('window:minimize', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize()
})

ipcMain.handle('window:close', (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close()
})

ipcMain.handle('window:open-repository', () => {
  void shell.openExternal('https://github.com/caunaweber/Klipr')
})

ipcMain.handle('show-notification', (_, options: { title: string; body: string }) => {
  if (!Notification.isSupported()) {
    return false
  }

  const notification = new Notification({
    title: options.title,
    body: options.body,
  })

  notification.on('click', () => {
    if (win && !win.isDestroyed()) {
      win.show()
      win.focus()
    }
  })

  notification.show()
  return true
})

if (process.platform === 'win32') {
  app.setAppUserModelId('com.caunaweber.klipr')
}

app.whenReady().then(() => {

  protocol.handle(
    'video',
    async (request) => {

      try {

        const videoId =
          getVideoIdFromRequestUrl(
            request.url
          )

        const filePath =
          getSelectedVideoPath(videoId)

        if (!filePath) {
          return new Response(
            'Video not authorized',
            {
              status: 403
            }
          )
        }

        const stat =
          await fs.promises.stat(
            filePath
          )

        const range =
          request.headers.get(
            'range'
          )

        const contentType =
          getVideoContentType(filePath)

        if (!range) {

          const stream =
            createVideoStreamBody(
              filePath
            )

          return new Response(
            stream,
            {
              headers: {
                'Content-Type':
                  contentType,
                'Content-Length':
                  String(stat.size),
                'Accept-Ranges':
                  'bytes'
              }
            }
          )
        }

        const parsedRange =
          parseRangeHeader(
            range,
            stat.size
          )

        if (!parsedRange) {
          return new Response(
            'Invalid range',
            {
              status: 416
            }
          )
        }

        const { start, end } = parsedRange

        const chunkSize =
          end - start + 1

        const stream =
          createVideoStreamBody(
            filePath,
            {
              start,
              end
            }
          )

        return new Response(
          stream,
          {
            status: 206,
            headers: {
              'Content-Type':
                contentType,
              'Content-Length':
                String(chunkSize),
              'Content-Range':
                `bytes ${start}-${end}/${stat.size}`,
              'Accept-Ranges':
                'bytes'
            }
          }
        )

      } catch (error) {

        console.error(
          'Video protocol error:',
          error
        )

        return new Response(
          'File not found',
          {
            status: 404
          }
        )
      }
    }
  )

  createWindow()
})
