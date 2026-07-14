import { ipcRenderer, contextBridge, webUtils } from 'electron'
import { CompressionRequest, CompressionResult } from './types/compression'
import { OpenedVideoPayload, VideoInfo } from './types/video'
import { TrimRequest, TrimResult } from './types/trim'


contextBridge.exposeInMainWorld('videoCompressor', {
  selectVideo: (): Promise<VideoInfo | null> =>
    ipcRenderer.invoke('select-video'),

  selectDroppedVideo: (file: File): Promise<VideoInfo> =>
    ipcRenderer.invoke(
      'select-dropped-video',
      webUtils.getPathForFile(file)
    ),

  consumePendingOpenVideo: (): Promise<VideoInfo | null> =>
    ipcRenderer.invoke('consume-pending-open-video'),

  compressVideo: (request: CompressionRequest): Promise<CompressionResult> =>
    ipcRenderer.invoke('compress-video', request),

  cancelVideoOperation: () =>
    ipcRenderer.invoke('cancel-video-operation'),

  openResultFolder: (outputId: string) =>
    ipcRenderer.invoke('open-result-folder', outputId),

  onProgress: (callback: (progress: number) => void) => {
    const listener = (_: Electron.IpcRendererEvent, progress: number) => {
      callback(progress)
    }
    ipcRenderer.on(
      'video-operation-progress',
      listener
    )
    return () => {
      ipcRenderer.removeListener('video-operation-progress', listener)
    }
  },

  onOpenedFromSystem: (callback: (payload: OpenedVideoPayload) => void) => {
    const listener = (_: Electron.IpcRendererEvent, payload: OpenedVideoPayload) => {
      callback(payload)
    }
    ipcRenderer.on(
      'video:opened-from-system',
      listener
    )
    return () => {
      ipcRenderer.removeListener('video:opened-from-system', listener)
    }
  },

  notify: (options: { title: string; body: string }) =>
    ipcRenderer.invoke('show-notification', options),

  trimVideo: (request: TrimRequest): Promise<TrimResult> =>
    ipcRenderer.invoke('trim-video', request),

})

contextBridge.exposeInMainWorld('windowControls', {
  minimize: () =>
    ipcRenderer.invoke('window:minimize'),

  toggleMaximize: () =>
    ipcRenderer.invoke('window:toggle-maximize'),

  isMaximized: (): Promise<boolean> =>
    ipcRenderer.invoke('window:is-maximized'),

  onMaximizedChange: (callback: (isMaximized: boolean) => void) => {
    const listener = (_: Electron.IpcRendererEvent, isMaximized: boolean) => {
      callback(isMaximized)
    }
    ipcRenderer.on(
      'window:maximized-change',
      listener
    )
    return () => {
      ipcRenderer.removeListener('window:maximized-change', listener)
    }
  },

  close: () =>
    ipcRenderer.invoke('window:close'),

  openRepository: () =>
    ipcRenderer.invoke('window:open-repository'),
})
