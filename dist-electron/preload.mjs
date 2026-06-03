"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("videoCompressor", {
  selectVideo: () => electron.ipcRenderer.invoke("select-video"),
  getVideoInfo: (filePath) => electron.ipcRenderer.invoke("get-video-info", filePath),
  compressVideo: (filePath, targetSizeMB, duration) => electron.ipcRenderer.invoke("compress-video", filePath, targetSizeMB, duration)
});
