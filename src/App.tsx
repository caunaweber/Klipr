import { useRef } from 'react'
import './App.css'
import { CodecSelect } from './components/CodecSelect'
import { CompressionProgress } from './components/CompressionProgress'
import { CompressionResult } from './components/CompressionResult'
import { TargetSizeInput } from './components/TargetSizeInput'
import { TrimRange } from './components/TrimRange'
import { TwoPassToggle } from './components/TwoPassToggle'
import { VideoDetails } from './components/VideoDetails'
import { VideoPreview } from './components/VideoPreview'
import { useVideoCompression } from './hooks/useVideoCompression'

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const {
    clipEnd,
    clipStart,
    codec,
    compressVideo,
    compressionResult,
    isCompressing,
    progress,
    selectVideo,
    setClipEnd,
    setClipStart,
    setCodec,
    setTargetSizeMB,
    setUseTwoPass,
    targetSizeMB,
    useTwoPass,
    videoInfo,
  } = useVideoCompression()

  const isCompressDisabled =
    !videoInfo || isCompressing || Number(targetSizeMB) >= videoInfo.sizeMB

  return (
    <main className="app">
      <h1>Video Compressor</h1>

      <section className="section">
        <CodecSelect codec={codec} onCodecChange={setCodec} />
        <TwoPassToggle
          checked={useTwoPass}
          onCheckedChange={setUseTwoPass}
        />
      </section>

      <button onClick={selectVideo} disabled={isCompressing}>
        Select video
      </button>

      {videoInfo && <VideoDetails videoInfo={videoInfo} />}

      {videoInfo && (
        <VideoPreview videoInfo={videoInfo} videoRef={videoRef} />
      )}

      {videoInfo && (
        <TrimRange
          clipEnd={clipEnd}
          clipStart={clipStart}
          duration={videoInfo.duration}
          onClipEndChange={setClipEnd}
          onClipStartChange={setClipStart}
          videoRef={videoRef}
        />
      )}

      <section className="section">
        <TargetSizeInput
          value={targetSizeMB}
          onValueChange={setTargetSizeMB}
        />

        <button onClick={compressVideo} disabled={isCompressDisabled}>
          {isCompressing ? 'Compressing...' : 'Compress'}
        </button>

        <CompressionProgress progress={progress} />
      </section>

      {compressionResult && <CompressionResult result={compressionResult} />}
    </main>
  )
}

export default App
