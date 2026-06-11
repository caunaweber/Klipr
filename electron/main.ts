import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { selectVideo, compressVideo } from './services/video.services'
import { CompressionRequest } from './types/compression'
import { protocol } from 'electron'
import mime from 'mime-types'
import fs from 'node:fs'
import { Readable } from 'node:stream'
import { terminateAllFfmpegProcesses } from './utils/process-registry.utils'
import { getSelectedVideoPath } from './utils/selected-video-registry.utils'
import { getGeneratedOutputPath } from './utils/generated-output-registry.utils'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let isShuttingDown = false
let isCompressionActive = false

interface ParsedRange {
  start: number
  end: number
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

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 720,
    autoHideMenuBar: true,
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

ipcMain.handle('compress-video', async (_, request: CompressionRequest) => {

  if (isCompressionActive) {
    throw new Error('A compression is already active')
  }

  isCompressionActive = true

  try {
    return await compressVideo(
      request,
      (progress) => {
        if (win && !win.isDestroyed()) {
          win.webContents.send(
            'compression-progress',
            progress
          )
        }
      }
    )
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    isCompressionActive = false
  }
})

ipcMain.handle('cancel-compression', async () => {
  await terminateAllFfmpegProcesses()
})

ipcMain.handle('open-result-folder', async (_, outputId: string) => {
  const outputPath = getGeneratedOutputPath(outputId)

  if (!outputPath) {
    throw new Error('Output file not authorized')
  }

  shell.showItemInFolder(outputPath)
})

app.whenReady().then(() => {

  protocol.handle(
    'video',
    async (request) => {

      try {

        const videoId =
          decodeURIComponent(
            request.url.slice(
              'video://'.length
            )
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
          mime.lookup(filePath)?.toString() ||
          'application/octet-stream'

        if (!range) {

          const stream = Readable.toWeb(
            fs.createReadStream(
              filePath
            )
          )

          return new Response(
            stream as unknown as BodyInit,
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

        const stream = Readable.toWeb(
          fs.createReadStream(
            filePath,
            {
              start,
              end
            }
          )
        )

        return new Response(
          stream as unknown as BodyInit,
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
