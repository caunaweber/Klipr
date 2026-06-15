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

    compressVideo: (
      request: import('./types/compression').CompressionRequest
    ) => Promise<import('./types/compression').CompressionResult>

    onProgress: (callback: (progress: number) => void) => () => void

    cancelCompression: () => Promise<void>

    openResultFolder: (outputId: string) => Promise<void>

    notify: (options: { title: string; body: string }) => Promise<boolean>

  }

  windowControls: {
    minimize: () => Promise<void>
    close: () => Promise<void>
    openRepository: () => Promise<void>
  }

}
