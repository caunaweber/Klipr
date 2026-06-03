import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('videoCompressor', {
  selectVideo: () => ipcRenderer.invoke('select-video'),

  getVideoInfo: (filePath: string) =>
    ipcRenderer.invoke('get-video-info', filePath),

  compressVideo: (filePath: string, targetSizeMB: number, duration: number) =>
    ipcRenderer.invoke('compress-video', filePath, targetSizeMB, duration),
})