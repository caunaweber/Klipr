import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { selectVideo, getVideoInfo, compressVideo } from './services/video.services'
import { CompressionCodec } from './types/compression'
import { protocol } from 'electron'
import mime from 'mime-types'
import fs from 'node:fs'
import { terminateAllFfmpegProcesses } from './utils/process-registry.utils'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let isShuttingDown = false

function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

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

ipcMain.handle('get-video-info', async (_, filePath: string) => {
  try {
    return await getVideoInfo(filePath)
  } catch (error) {
    console.error(error)
    throw error
  }
}
)

ipcMain.handle('compress-video', async (_, filePath: string, targetSizeMB: number, duration: number, width: number, height: number,
  useTwoPass: boolean, codec: CompressionCodec, startTime?: number, endTime?: number) => {
  try {
    return await compressVideo(filePath,
      targetSizeMB,
      duration,
      width,
      height,
      useTwoPass,
      codec,
      (progress) => {
        if (win && !win.isDestroyed()) {
          win.webContents.send(
            'compression-progress',
            progress)
        }
      },
      startTime,
      endTime,)
  } catch (error) {
    console.error(error)
    throw error
  }
})

app.whenReady().then(() => {

  protocol.handle(
    'video',
    async (request) => {

      try {

        const filePath =
          decodeURIComponent(
            request.url.slice(
              'video://'.length
            )
          )

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

          const stream =
            fs.createReadStream(
              filePath
            )

          return new Response(
            stream as any,
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

        const parts =
          range.replace(
            /bytes=/,
            ''
          ).split('-')

        const start =
          Number(parts[0])

        if (
          Number.isNaN(start)
        ) {
          return new Response(
            'Invalid range',
            {
              status: 416
            }
          )
        }

        const end =
          parts[1]
            ? Number(parts[1])
            : stat.size - 1

        const chunkSize =
          end - start + 1

        const stream =
          fs.createReadStream(
            filePath,
            {
              start,
              end
            }
          )

        return new Response(
          stream as any,
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
