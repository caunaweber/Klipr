# Third-Party Notices

This document applies to the Windows x64 distribution of Klipr 1.2.0.

Klipr uses FFmpeg and FFprobe as separate command-line programs for local
video processing. The licenses listed below apply to those third-party
components. This notice does not change the license of the Klipr source code.

## FFmpeg executable

- Component: FFmpeg
- Distributed version: 6.1.1-essentials_build-www.gyan.dev
- Copyright: FFmpeg developers and contributors
- Build provider: https://www.gyan.dev/ffmpeg/builds/
- Project: https://ffmpeg.org/
- License: GNU General Public License, version 3 or later
- Corresponding FFmpeg source revision:
  https://github.com/FFmpeg/FFmpeg/commit/e38092ef93
- Windows x64 binary SHA-256:
  `04E1307997530F9CF2FE35CBA2CA7E8875CA91DA02F89D6C7243DF819C94AD00`

The complete license text is installed as `legal/GPL-3.0.txt`. The build
configuration and enabled third-party libraries are installed as
`legal/FFMPEG-6.1.1-BUILD.txt`.

## FFprobe executable

- Component: FFprobe, part of the FFmpeg project
- Distributed version: 6.1.1-essentials_build-www.gyan.dev
- Copyright: FFmpeg developers and contributors
- Binary distribution package: @derhuerst/ffprobe-static 5.3.0
- Package project: https://github.com/eugeneware/ffmpeg-static
- Build provider: https://www.gyan.dev/ffmpeg/builds/
- Project: https://ffmpeg.org/
- License: GNU General Public License, version 3 or later
- Corresponding FFmpeg source revision:
  https://github.com/FFmpeg/FFmpeg/commit/e38092ef93
- Windows x64 binary SHA-256:
  `3A7E2DC003DC2CD1472827E4C7C4F056AE1AE0AE7C5BBC580C99B49827351BA4`

The complete license text is installed as `legal/GPL-3.0.txt`. The build
configuration reported by the executable is installed as
`legal/FFPROBE-6.1.1-BUILD.txt`.

## Node.js binary wrappers

Klipr also distributes the Node.js packages used to locate these programs:

- `ffmpeg-static` 5.3.0, licensed under GPL-3.0-or-later.
- `@derhuerst/ffprobe-static` 5.3.0, licensed under GPL-3.0-or-later.

## Corresponding source

The corresponding source and build materials distributed for Klipr 1.2.0 are
published with the release assets at:

https://github.com/caunaweber/Klipr/releases/tag/v1.2.0

FFmpeg and FFprobe are provided without warranty, as described in the GNU
General Public License.
