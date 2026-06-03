import { dialog, app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";
import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
const execFileAsync = promisify(execFile);
const require$1 = createRequire(import.meta.url);
const ffprobe = require$1("ffprobe-static");
const ffmpeg = require$1("ffmpeg-static");
async function selectVideo() {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [
      { name: "Videos", extensions: ["mp4", "avi", "mkv"] }
    ]
  });
  if (result.canceled) {
    return null;
  }
  return result.filePaths[0];
}
async function getVideoInfo(filePath) {
  const stats = fs.statSync(filePath);
  const { stdout } = await execFileAsync(
    ffprobe.path,
    [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath
    ]
  );
  const data = JSON.parse(stdout);
  const videoStream = data.streams.find(
    (stream) => stream.codec_type === "video"
  );
  return {
    fileName: path.basename(filePath),
    filePath,
    sizeMB: Number((stats.size / (1024 * 1024)).toFixed(2)),
    duration: Number(data.format.duration),
    width: videoStream.width,
    height: videoStream.height,
    codec: videoStream.codec_name
  };
}
async function compressVideo(filePath, targetSizeMB, duration) {
  const targetBits = targetSizeMB * 1024 * 1024 * 8;
  const videoBitrate = Math.floor(targetBits / duration);
  const bitrateKbps = Math.floor(videoBitrate / 1e3);
  const parsedFile = path.parse(filePath);
  const outputPath = path.join(parsedFile.dir, `${parsedFile.name}-compressed.mp4`);
  console.log({
    targetSizeMB,
    duration,
    bitrateKbps,
    outputPath
  });
  await execFileAsync(
    ffmpeg,
    [
      "-i",
      filePath,
      "-b:v",
      `${bitrateKbps}k`,
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      outputPath
    ]
  );
  return outputPath;
}
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.handle("select-video", selectVideo);
ipcMain.handle(
  "get-video-info",
  async (_, filePath) => {
    try {
      return await getVideoInfo(filePath);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);
ipcMain.handle("compress-video", async (_, filePath, targetSizeMB, duration) => {
  try {
    return await compressVideo(filePath, targetSizeMB, duration);
  } catch (error) {
    console.error(error);
    throw error;
  }
});
app.whenReady().then(createWindow);
export {
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
