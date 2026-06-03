import { useState } from 'react'
import './App.css'
import { VideoInfo } from './types/video'

function App() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [compressedPath, setCompressedPath] = useState('')
  const [targetSizeMB, setTargetSizeMB] = useState<string>('10')


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

    try {
      const outputPath =
        await window.videoCompressor.compressVideo(
          videoInfo.filePath,
          Number(targetSizeMB),
          videoInfo.duration
        )

      setCompressedPath(outputPath)

    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <h1>Video Compressor</h1>

      <button onClick={selectVideo}>
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

      <button onClick={compressVideo}>
        Comprimir
      </button>

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
