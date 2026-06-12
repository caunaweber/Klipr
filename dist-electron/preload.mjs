"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("videoCompressor", {
  selectVideo: () => electron.ipcRenderer.invoke("select-video"),
  selectDroppedVideo: (filePath) => electron.ipcRenderer.invoke("select-dropped-video", filePath),
  getPathForFile: (file) => electron.webUtils.getPathForFile(file),
  compressVideo: (request) => electron.ipcRenderer.invoke("compress-video", request),
  cancelCompression: () => electron.ipcRenderer.invoke("cancel-compression"),
  openResultFolder: (outputId) => electron.ipcRenderer.invoke("open-result-folder", outputId),
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
