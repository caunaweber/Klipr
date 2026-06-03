import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/electron-vite.animate.svg'
import './App.css'
import { VideoInfo } from './types/video'

function App() {
  const [message, setMessage] = useState('')
  const [videoPath, setVideoPath] = useState('')
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)

  const testMessage = async () => {
    const result = await window.videoCompressor.hello()
    setMessage(result)
  }

  const selectVideo = async () => {
    const path = await window.videoCompressor.selectVideo()

    if (!path) {
      setVideoPath('No video selected')
      setVideoInfo(null)
      return
    }

    setVideoPath(path)

    const info = await window.videoCompressor.getVideoInfo(path)

    setVideoInfo(info)
  }

  return (
    <>
      <div>
        <a href="https://electron-vite.github.io" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">

        <button onClick={testMessage}>
          Testar IPC
        </button>

        <button onClick={selectVideo}>
          Select mp4 video
        </button>
        {videoInfo && (
          <div>
            <h3>Informações do vídeo</h3>

            <p>Arquivo: {videoInfo.fileName}</p>

            <p>Tamanho: {videoInfo.sizeMB} MB</p>

            <p>
              Resolução: {videoInfo.width} x {videoInfo.height}
            </p>

            <p>
              Duração: {Math.floor(videoInfo.duration)} segundos
            </p>

            <p>
              Codec: {videoInfo.codec}
            </p>
          </div>
        )}
        <p>{message}</p>
      </div>
    </>
  )
}

export default App
