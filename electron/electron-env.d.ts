/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.js
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Used in Renderer process, expose in `preload.ts`
interface Window {
  ipcRenderer: import('electron').IpcRenderer

  videoCompressor: {
    selectVideo: () => Promise<VideoInfo | null>

    selectDroppedVideo: (file: File) => Promise<VideoInfo>

    consumePendingOpenVideo: () => Promise<VideoInfo | null>

    compressVideo: (
      request: import('./types/compression').CompressionRequest
    ) => Promise<import('./types/compression').CompressionResult>

    onProgress: (callback: (progress: number) => void) => () => void

    onOpenedFromSystem: (
      callback: (payload: import('./types/video').OpenedVideoPayload) => void
    ) => () => void

    cancelVideoOperation: () => Promise<void>

    openResultFolder: (outputId: string) => Promise<void>

    notify: (options: { title: string; body: string }) => Promise<boolean>

    trimVideo: (
      request: import('./types/trim').TrimRequest
    ) => Promise<import('./types/trim').TrimResult>

    getEncoderCapabilities: () => Promise<import('./types/encoder').EncoderCapabilities>
  }

  windowControls: {
    minimize: () => Promise<void>
    toggleMaximize: () => Promise<void>
    isMaximized: () => Promise<boolean>
    onMaximizedChange: (callback: (isMaximized: boolean) => void) => () => void
    close: () => Promise<void>
    openRepository: () => Promise<void>
  }

}
