import { ipcRenderer, contextBridge } from 'electron'
import { CompressionCodec } from './types/compression'

contextBridge.exposeInMainWorld('videoCompressor', {
  selectVideo: () => ipcRenderer.invoke('select-video'),

  getVideoInfo: (filePath: string) =>
    ipcRenderer.invoke('get-video-info', filePath),

  compressVideo: (filePath: string, targetSizeMB: number, duration: number, width: number, height: number,
    useTwoPass: boolean, codec: CompressionCodec, startTime?: number, endTime?: number) =>
    ipcRenderer.invoke('compress-video',
      filePath,
      targetSizeMB,
      duration,
      width,
      height,
      useTwoPass,
      codec,
      startTime,
      endTime),

  cancelCompression: () =>
    ipcRenderer.invoke('cancel-compression'),

  openResultFolder: (filePath: string) =>
    ipcRenderer.invoke('open-result-folder', filePath),

  onProgress: (callback: (progress: number) => void) => {
    const listener = (_: Electron.IpcRendererEvent, progress: number) => {
      callback(progress)
    }
    ipcRenderer.on(
      'compression-progress',
      listener
    )
    return () => {
      ipcRenderer.removeListener('compression-progress', listener)
    }
  },

})
