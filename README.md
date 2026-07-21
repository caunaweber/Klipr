# Klipr

**English** | [Português](README.pt-BR.md)

**Klipr** is a desktop app for trimming and compressing video clips so they are easier to share on Discord, WhatsApp, email, social media, and other platforms with upload limits.

It was originally built for gameplay clips: select a local video, choose the exact moment you want to keep, set a target file size, and export a smaller MP4 ready to send.

[Download Klipr for Windows](https://github.com/caunaweber/Klipr/releases/latest)

## Why Klipr

Sharing clips is often blocked by file size limits. Klipr provides a direct workflow for that problem: load a clip, trim it, choose the final size and frame rate, select an available encoder, and compress it locally.

The app is designed for quick everyday use, but the project also explores desktop development concerns such as secure Electron IPC, local file handling, custom media preview, FFmpeg process management, and production packaging.

## What's New in 1.2.0

- Added hardware video encoding with AMD AMF and NVIDIA NVENC.
- Detects available FFmpeg encoders when the app starts and shows only supported options.
- Keeps encoder selection under the user's control, with CPU encoding always available.
- Added output frame-rate control with Native, 30 FPS, 60 FPS, and 120 FPS options.
- Added Windows **Open with Klipr** integration for supported video files.
- Added clear GPU encoding error handling through the standard app notification.
- Simplified compression to a single-pass workflow.
- Updated FFprobe to 6.1.1 and reduced unnecessary files in the Windows installer.

## What's New in 1.1.1

- Fixed the Windows taskbar preview/window title showing the default Vite template name instead of Klipr.
- Added a maximize/restore button to the custom title bar.

## What's New in 1.1.0

- Added Trim only export for cutting clips without recompressing them.
- Uses fast keyframe-based cutting for near-instant trim exports.
- Improved the custom video player layout and trim controls.
- Updated dependencies and resolved known npm audit vulnerabilities.

## Features

- Select local videos through the file picker, drag and drop, or **Open with Klipr** on Windows.
- Preview the selected video inside the app.
- Trim clips by choosing start and end points.
- Export a selected clip without compression.
- Set a target output size in MB.
- Encode AVC/H.264 or HEVC/H.265 using the CPU.
- Use AMD AMF or NVIDIA NVENC when compatible hardware and drivers are detected.
- Keep the source frame rate or export at 30, 60, or 120 FPS when supported by the source.
- Cancel an active compression.
- Open the output folder after export finishes.
- Supports MP4, MKV, MOV, WebM, and AVI input files.
- Exports compressed videos and trimmed clips as MP4.

## GPU Encoding

Klipr asks FFmpeg which encoders are available on the current computer and validates GPU encoders before showing them. CPU encoders remain available as the safe default.

- **AMD AMF:** requires a compatible AMD GPU and graphics driver.
- **NVIDIA NVENC:** requires a compatible NVIDIA GPU and graphics driver.

## Technical Highlights

- Built with Electron, React, TypeScript, Vite, and Tailwind CSS.
- Uses FFmpeg and FFprobe for local video processing.
- Keeps file-system access in the Electron main process.
- Uses a preload bridge instead of exposing Node.js APIs to the renderer.
- Validates selected and dropped files before processing.
- Streams authorized video previews through a custom `video://` protocol.
- Tracks active FFmpeg processes to support cancellation and app shutdown cleanup.
- Packages a Windows x64 installer with Electron Builder.

## Installation

Download the latest Windows installer from the Releases page:

[Klipr releases](https://github.com/caunaweber/Klipr/releases/latest)

For version 1.2.0, the installer file is:

```text
Klipr-Windows-1.2.0-Setup.exe
```

Run the setup file normally and launch Klipr after installation.

## Development

Install dependencies:

```bash
npm install
```

Run in development mode:

```bash
npm run dev
```

Run the tests:

```bash
npm test
```

Run lint:

```bash
npm run lint
```

Build the desktop app:

```bash
npm run build
```

The Windows installer is generated under:

```text
release/<version>/Klipr-Windows-<version>-Setup.exe
```

## Tech Stack

- Electron
- React
- TypeScript
- Vite
- Tailwind CSS
- FFmpeg and FFprobe
- Electron Builder

## Privacy

Klipr processes videos locally on the user's machine. Selected files are not uploaded to an external server by the app.
