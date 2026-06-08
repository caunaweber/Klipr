import { useState, useEffect } from 'react'
import './App.css'
import { VideoInfo } from '../electron/types/video'
import { Range } from 'react-range'
import { useRef } from 'react'

function App() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [compressedPath, setCompressedPath] = useState('')
  const [targetSizeMB, setTargetSizeMB] = useState<string>('10')
  const [progress, setProgress] = useState(0)
  const [useTwoPass, setUseTwoPass] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const [codec, setCodec] = useState<'h265' | 'h264'>('h265')
  const [clipStart, setClipStart] = useState(0)
  const [clipEnd, setClipEnd] = useState(0)
  const [activeThumb, setActiveThumb] = useState<number>(0)

  const videoRef = useRef<HTMLVideoElement>(null)

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

    setClipStart(0)
    setClipEnd(info.duration)

    setProgress(0)
  }

  const formatDuration = (
    seconds: number
  ) => {

    const minutes =
      Math.floor(seconds / 60)

    const remainingSeconds =
      Math.floor(seconds % 60)

    const tenths =
      Math.floor(
        (seconds % 1) * 10
      )

    return `${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds
        .toString()
        .padStart(2, '0')}.${tenths}`
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
          codec,
          clipStart,
          clipEnd,
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
        </div>
      )}

      {videoInfo && (
        <>
          <video
            ref={videoRef}
            src={`video://${encodeURIComponent(videoInfo.filePath)}`}
            controls
            width={400}
            onLoadedMetadata={() =>
              console.log('video carregado')
            }
            onError={(e) =>
              console.error('erro video', e)
            }
          />
        </>
      )}

      {videoInfo && (
        <div>
          <h3>trim</h3>

          <Range
            step={0.1}
            min={0}
            max={videoInfo.duration}
            values={[clipStart, clipEnd]}
            onChange={(values) => {

              const [start, end] = values

              if (end - start < 1) {
                return
              }

              setClipStart(start)
              setClipEnd(end)

              if (!videoRef.current) {
                return
              }

              videoRef.current.currentTime =
                activeThumb === 0
                  ? start
                  : end
            }}
            renderTrack={({ props, children }) => (
              <div
                {...props}
                style={{
                  ...props.style,
                  height: '6px',
                  width: '100%',
                  background: `linear-gradient(
          to right,
          #444 0%,
          #444 ${(clipStart / videoInfo.duration) * 100}%,
          #4caf50 ${(clipStart / videoInfo.duration) * 100}%,
          #4caf50 ${(clipEnd / videoInfo.duration) * 100}%,
          #444 ${(clipEnd / videoInfo.duration) * 100}%,
          #444 100%
        )`
                }}
              >
                {children}
              </div>
            )}
            renderThumb={({ props, index }) => (
              <div
                {...props}
                onMouseDown={() =>
                  setActiveThumb(index)
                }
                style={{
                  ...props.style,
                  width: '6px',
                  height: '24px',
                  borderRadius: '1px',
                  backgroundColor: '#fff',
                  border: '1px solid #000',
                  cursor: 'grab'
                }}
              />
            )}
          />

          <p>
            Corte:
            {formatDuration(clipStart)}
            {' → '}
            {formatDuration(clipEnd)}
            {' ('}
            {formatDuration(clipEnd - clipStart)}
            {')'}
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
