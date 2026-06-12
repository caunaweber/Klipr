import { useRef } from 'react'
import './App.css'
import { FileVideo, Play, SlidersHorizontal, Upload } from 'lucide-react'
import { CodecSelect } from './components/CodecSelect'
import { CompressionProgress } from './components/CompressionProgress'
import { CompressionResult } from './components/CompressionResult'
import { TargetSizeInput } from './components/TargetSizeInput'
import { TrimRange } from './components/TrimRange'
import { TwoPassToggle } from './components/TwoPassToggle'
import { VideoDetails } from './components/VideoDetails'
import { VideoPreview } from './components/VideoPreview'
import { Button } from './components/ui/button'
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
    <main className="min-h-screen px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileVideo className="h-4 w-4" />
              Desktop video utility
            </div>
            <h1 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
              Video Compressor
            </h1>
          </div>

          <Button
            className="w-full sm:w-auto"
            onClick={selectVideo}
            disabled={isCompressing}
          >
            <Upload />
            Select video
          </Button>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            {videoInfo ? (
              <>
                <VideoPreview videoInfo={videoInfo} videoRef={videoRef} />
                <VideoDetails videoInfo={videoInfo} />
                <TrimRange
                  clipEnd={clipEnd}
                  clipStart={clipStart}
                  duration={videoInfo.duration}
                  onClipEndChange={setClipEnd}
                  onClipStartChange={setClipStart}
                  videoRef={videoRef}
                />
              </>
            ) : (
              <section className="flex min-h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-8 text-center shadow-soft">
                <div className="mb-4 rounded-full bg-accent p-3 text-accent-foreground">
                  <Upload className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold">Select a video</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Choose a local file to preview it, trim the clip, and set the
                  compression target.
                </p>
                <Button
                  className="mt-5"
                  variant="secondary"
                  onClick={selectVideo}
                  disabled={isCompressing}
                >
                  <Upload />
                  Browse file
                </Button>
              </section>
            )}
          </div>

          <aside className="flex flex-col gap-5">
            <section className="rounded-lg border border-border bg-card p-5 shadow-soft">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                <h2 className="text-base font-semibold">Compression</h2>
              </div>

              <div className="flex flex-col gap-4">
                <CodecSelect codec={codec} onCodecChange={setCodec} />
                <TwoPassToggle
                  checked={useTwoPass}
                  onCheckedChange={setUseTwoPass}
                />
                <TargetSizeInput
                  value={targetSizeMB}
                  onValueChange={setTargetSizeMB}
                />

                <Button
                  className="mt-1 w-full"
                  onClick={compressVideo}
                  disabled={isCompressDisabled}
                >
                  <Play />
                  {isCompressing ? 'Compressing...' : 'Compress'}
                </Button>

                <CompressionProgress progress={progress} />
              </div>
            </section>

            {compressionResult && (
              <CompressionResult result={compressionResult} />
            )}
          </aside>
        </section>
      </div>
    </main>
  )
}

export default App
