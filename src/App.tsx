import { useState, useEffect } from 'react'
import './App.css'
import { VideoInfo } from '../electron/types/video'

function App() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [compressedPath, setCompressedPath] = useState('')
  const [targetSizeMB, setTargetSizeMB] = useState<string>('10')
  const [progress, setProgress] = useState(0)
  const [useTwoPass, setUseTwoPass] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [codec, setCodec] = useState<'h265' | 'h264'>('h265')


  const selectVideo = async () => {
    const path =
      await window.videoCompressor.selectVideo()

    if (!path) {
      setVideoInfo(null)
      return
    }

    const info =
      await window.videoCompressor.getVideoInfo(path)

    setVideoInfo(info)
    setProgress(0)
  }

  const formatDuration = (
    seconds: number
  ) => {
    const h =
      Math.floor(seconds / 3600)

    const m =
      Math.floor(
        (seconds % 3600) / 60
      )

    const s =
      Math.floor(seconds % 60)

    return `${h}h ${m}m ${s}s`
  }

  const compressVideo = async () => {
    if (!videoInfo) return

    setIsCompressing(true)

    try {

      setProgress(0)
      setCompressedPath('')

      const outputPath =
        await window.videoCompressor.compressVideo(
          videoInfo.filePath,
          Number(targetSizeMB),
          videoInfo.duration,
          videoInfo.width,
          videoInfo.height,
          useTwoPass,
          codec
        )

      setCompressedPath(outputPath)

    } catch (error) {

      console.error(error)

    } finally {

      setIsCompressing(false)

    }
  }

  useEffect(() => {
    const unsubscribe =
      window.videoCompressor.onProgress(
        setProgress
      )
    return unsubscribe
  }, [])

  return (
    <div>
      <h1>Video Compressor</h1>

      <label>Codec:</label>

      <select
        value={codec}
        onChange={(e) =>
          setCodec(
            e.target.value as
            | 'h264'
            | 'h265'
          )
        }
      >
        <option value="h264">
          AVC (H.264)
        </option>

        <option value="h265">
          HEVC (H.265)
        </option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={useTwoPass}
          onChange={(e) =>
            setUseTwoPass(e.target.checked)
          }
        />

        2-pass compression
      </label>

      <br />

      <button onClick={selectVideo}
        disabled={isCompressing}>
        Selecionar vídeo
      </button>

      {videoInfo && (
        <div>
          <h2>
            {videoInfo.fileName}
          </h2>

          <p>
            Tamanho:
            {videoInfo.sizeMB} MB
          </p>

          <p>
            Duração:
            {formatDuration(
              videoInfo.duration
            )}
          </p>

          <p>
            Resolução:
            {videoInfo.width} x
            {videoInfo.height}
          </p>

          <p>
            Codec:
            {videoInfo.codec}
          </p>

        </div>
      )}

      <input
        type="number"
        min={1}
        value={targetSizeMB}
        onChange={(e) =>
          setTargetSizeMB(e.target.value)
        }
      />

      <br />
      <button
        onClick={compressVideo}
        disabled={
          !videoInfo ||
          isCompressing ||
          Number(targetSizeMB) >= videoInfo.sizeMB
        }
      >
        {
          isCompressing
            ? 'Comprimindo...'
            : 'Comprimir'
        }
      </button>

      <br />

      <progress
        value={progress}
        max={100}
      />

      {compressedPath && (
        <p>
          Vídeo salvo em:
          {compressedPath}
        </p>
      )}

    </div>
  )
}

export default App
