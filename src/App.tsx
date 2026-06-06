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
          useTwoPass
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

      <button
        onClick={compressVideo}
        disabled={
          !videoInfo ||
          isCompressing
        }
      >
        {
          isCompressing
            ? 'Comprimindo...'
            : 'Comprimir'
        }
      </button>

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
