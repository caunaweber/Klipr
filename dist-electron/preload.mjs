"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("videoCompressor", {
  selectVideo: () => electron.ipcRenderer.invoke("select-video"),
  getVideoInfo: (filePath) => electron.ipcRenderer.invoke("get-video-info", filePath),
  compressVideo: (filePath, targetSizeMB, duration, width, height, useTwoPass) => electron.ipcRenderer.invoke("compress-video", filePath, targetSizeMB, duration, width, height, useTwoPass),
  onProgress: (callback) => {
    const listener = (_, progress) => {
      callback(progress);
    };
    electron.ipcRenderer.on(
      "compression-progress",
      listener
    );
    return () => {
      electron.ipcRenderer.removeListener("compression-progress", listener);
    };
  }
});
