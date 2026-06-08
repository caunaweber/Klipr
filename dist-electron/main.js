import { dialog, app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";
import { spawn, execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
function calculateVideoBitrate(targetSizeMB, duration, audioBitrateKbps = 128) {
  const overheadFactor = 0.98;
  const targetBits = targetSizeMB * 1024 * 1024 * 8 * overheadFactor;
  const audioBits = audioBitrateKbps * 1e3 * duration;
  const videoBits = targetBits - audioBits;
  const bitrateKbps = Math.round(videoBits / duration / 1e3);
  if (bitrateKbps < 100) {
    throw new Error("Target size is too small for this video.");
  }
  return {
    bitrateKbps,
    audioBitrateKbps
  };
}
function attachProgressListener(process2, duration, onProgress, startPercent, endPercent) {
  process2.stdout.on(
    "data",
    (data) => {
      const output = data.toString();
      const match = output.match(
        /out_time_ms=(\d+)/
      );
      if (!match) return;
      const currentSeconds = Number(match[1]) / 1e6;
      const progress = Math.min(
        endPercent,
        startPercent + Math.floor(
          currentSeconds / duration * (endPercent - startPercent)
        )
      );
      onProgress(progress);
    }
  );
}
function captureStderr(process2) {
  let stderrOutput = "";
  process2.stderr.on(
    "data",
    (data) => {
      stderrOutput += data.toString();
    }
  );
  return () => stderrOutput;
}
function calculateResolution(width, height, bitrateKbps) {
  if (bitrateKbps < 700) {
    return {
      width: 854,
      height: 480
    };
  }
  if (bitrateKbps < 2e3) {
    return {
      width: 1280,
      height: 720
    };
  }
  return {
    width,
    height
  };
}
const require$3 = createRequire(import.meta.url);
const ffmpeg$1 = require$3("ffmpeg-static");
async function onePassCompression(options) {
  const {
    filePath,
    targetSizeMB,
    duration,
    onProgress,
    width,
    height
  } = options;
  const {
    bitrateKbps,
    audioBitrateKbps
  } = calculateVideoBitrate(targetSizeMB, duration);
  const resolution = calculateResolution(width, height, bitrateKbps);
  const parsedFile = path.parse(filePath);
  const outputPath = path.join(
    parsedFile.dir,
    `${parsedFile.name}-compressed.mp4`
  );
  console.log({
    ffmpeg: ffmpeg$1,
    filePath,
    targetSizeMB,
    bitrateKbps,
    outputPath
  });
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(
      ffmpeg$1,
      [
        "-y",
        "-i",
        filePath,
        "-b:v",
        `${bitrateKbps}k`,
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        "-b:a",
        `${audioBitrateKbps}k`,
        "-vf",
        `scale=${resolution.width}:${resolution.height}`,
        "-progress",
        "pipe:1",
        outputPath
      ]
    );
    console.log("FFmpeg process created");
    let finished = false;
    ffmpegProcess.on(
      "error",
      (error) => {
        if (finished) return;
        finished = true;
        console.error(
          "FFmpeg process error:",
          error
        );
        reject(error);
      }
    );
    const getStderr = captureStderr(ffmpegProcess);
    attachProgressListener(
      ffmpegProcess,
      duration,
      onProgress,
      0,
      100
    );
    ffmpegProcess.on("close", (code) => {
      if (finished) return;
      finished = true;
      console.log(
        `FFmpeg closed with code ${code}`
      );
      if (code === 0) {
        console.log(
          "Compression finished"
        );
        onProgress(100);
        resolve(outputPath);
      } else {
        reject(
          new Error(
            `FFmpeg exited with code ${code}
${getStderr()}`
          )
        );
      }
    });
  });
}
const require$2 = createRequire(import.meta.url);
const ffmpeg = require$2("ffmpeg-static");
async function twoPassCompression(options) {
  const {
    filePath,
    targetSizeMB,
    duration,
    onProgress,
    width,
    height
  } = options;
  const {
    bitrateKbps,
    audioBitrateKbps
  } = calculateVideoBitrate(
    targetSizeMB,
    duration
  );
  const resolution = calculateResolution(width, height, bitrateKbps);
  const parsedFile = path.parse(filePath);
  const outputPath = path.join(
    parsedFile.dir,
    `${parsedFile.name}-compressed.mp4`
  );
  const passLogFile = path.join(
    parsedFile.dir,
    `${parsedFile.name}-passlog`
  );
  console.log({
    ffmpeg,
    filePath,
    targetSizeMB,
    bitrateKbps,
    outputPath
  });
  console.log("Starting first pass...");
  cleanupPassLogs(passLogFile);
  await new Promise((resolve, reject) => {
    const pass1Process = spawn(ffmpeg, [
      "-y",
      "-i",
      filePath,
      "-fps_mode",
      "cfr",
      "-c:v",
      "libx264",
      "-b:v",
      `${bitrateKbps}k`,
      "-pass",
      "1",
      "-passlogfile",
      passLogFile,
      "-an",
      "-progress",
      "pipe:1",
      "-f",
      "null",
      process.platform === "win32" ? "NUL" : "/dev/null"
    ]);
    let finished = false;
    pass1Process.on(
      "error",
      (error) => {
        if (finished) return;
        finished = true;
        console.error(
          "First pass process error:",
          error
        );
        cleanupPassLogs(passLogFile);
        reject(error);
      }
    );
    const getStderr = captureStderr(pass1Process);
    attachProgressListener(
      pass1Process,
      duration,
      onProgress,
      0,
      50
    );
    pass1Process.on(
      "close",
      (code) => {
        if (finished) return;
        finished = true;
        if (code === 0) {
          onProgress(50);
          resolve();
        } else {
          cleanupPassLogs(passLogFile);
          reject(
            new Error(
              `First pass failed with code ${code}
${getStderr()}`
            )
          );
        }
      }
    );
  });
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn(ffmpeg, [
      "-y",
      "-i",
      filePath,
      "-fps_mode",
      "cfr",
      "-c:v",
      "libx264",
      "-b:v",
      `${bitrateKbps}k`,
      "-pass",
      "2",
      "-passlogfile",
      passLogFile,
      "-c:a",
      "aac",
      "-b:a",
      `${audioBitrateKbps}k`,
      "-vf",
      `scale=${resolution.width}:${resolution.height}`,
      "-progress",
      "pipe:1",
      outputPath
    ]);
    console.log("FFmpeg process created");
    let finished = false;
    ffmpegProcess.on(
      "error",
      (error) => {
        if (finished) return;
        finished = true;
        console.error(
          "FFmpeg process error:",
          error
        );
        cleanupPassLogs(passLogFile);
        reject(error);
      }
    );
    const getStderr = captureStderr(ffmpegProcess);
    attachProgressListener(
      ffmpegProcess,
      duration,
      onProgress,
      50,
      100
    );
    ffmpegProcess.on("close", (code) => {
      if (finished) return;
      finished = true;
      console.log(
        `FFmpeg closed with code ${code}`
      );
      cleanupPassLogs(passLogFile);
      if (code === 0) {
        console.log(
          "Compression finished"
        );
        onProgress(100);
        resolve(outputPath);
      } else {
        reject(
          new Error(
            `FFmpeg exited with code ${code}
${getStderr()}`
          )
        );
      }
    });
  });
}
function cleanupPassLogs(passLogFile) {
  try {
    fs.unlinkSync(
      `${passLogFile}-0.log`
    );
  } catch {
  }
  try {
    fs.unlinkSync(
      `${passLogFile}-0.log.mbtree`
    );
  } catch {
  }
}
const execFileAsync = promisify(execFile);
const require$1 = createRequire(import.meta.url);
const ffprobe = require$1("ffprobe-static");
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
async function compressVideo(filePath, targetSizeMB, duration, width, height, useTwoPass, onProgress) {
  if (useTwoPass) {
    return twoPassCompression({
      filePath,
      targetSizeMB,
      duration,
      width,
      height,
      onProgress
    });
  }
  return onePassCompression({
    filePath,
    targetSizeMB,
    duration,
    width,
    height,
    onProgress
  });
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
ipcMain.handle("compress-video", async (_, filePath, targetSizeMB, duration, width, height, useTwoPass) => {
  try {
    return await compressVideo(filePath, targetSizeMB, duration, width, height, useTwoPass, (progress) => {
      win == null ? void 0 : win.webContents.send(
        "compression-progress",
        progress
      );
    });
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
