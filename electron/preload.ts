import { ipcRenderer, contextBridge, webUtils } from 'electron'
import { CompressionRequest, CompressionResult } from './types/compression'
import { VideoInfo } from './types/video'


contextBridge.exposeInMainWorld('videoCompressor', {
  selectVideo: (): Promise<VideoInfo | null> =>
    ipcRenderer.invoke('select-video'),

  selectDroppedVideo: (filePath: string): Promise<VideoInfo> =>
    ipcRenderer.invoke('select-dropped-video', filePath),

  getPathForFile: (file: File): string =>
    webUtils.getPathForFile(file),

  compressVideo: (request: CompressionRequest): Promise<CompressionResult> =>
    ipcRenderer.invoke('compress-video', request),

  cancelCompression: () =>
    ipcRenderer.invoke('cancel-compression'),

  openResultFolder: (outputId: string) =>
    ipcRenderer.invoke('open-result-folder', outputId),

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
