import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('videoCompressor', {
  selectVideo: () => ipcRenderer.invoke('select-video'),

  getVideoInfo: (filePath: string) =>
    ipcRenderer.invoke('get-video-info', filePath),

  compressVideo: (filePath: string, targetSizeMB: number, duration: number, useTwoPass: boolean) =>
    ipcRenderer.invoke('compress-video', filePath, targetSizeMB, duration, useTwoPass),

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