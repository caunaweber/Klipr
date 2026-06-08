import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { selectVideo, getVideoInfo, compressVideo } from './services/video.services'
import { CompressionCodec } from './types/compression'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

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

ipcMain.handle('compress-video', async (_, filePath: string, targetSizeMB: number, duration: number, width: number, height: number, useTwoPass: boolean, codec: CompressionCodec) => {
  try {
    return await compressVideo(filePath, 
      targetSizeMB, 
      duration, 
      width, 
      height, 
      useTwoPass, 
      codec, 
      (progress) => {
      win?.webContents.send(
        'compression-progress',
        progress
      )
    })
  } catch (error) {
    console.error(error)
    throw error
  }
})

app.whenReady().then(createWindow)
