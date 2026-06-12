import { useRef } from 'react'
import './App.css'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Play,
  SlidersHorizontal,
  Square,
} from 'lucide-react'
import { CodecSelect } from './components/CodecSelect'
import { CompressionProgress } from './components/CompressionProgress'
import { CompressionResult } from './components/CompressionResult'
import { TargetSizeInput } from './components/TargetSizeInput'
import { TwoPassToggle } from './components/TwoPassToggle'
import { VideoDropzone } from './components/VideoDropzone'
import { VideoPreview } from './components/VideoPreview'
import { Button } from './components/ui/button'
import { useVideoCompression } from './hooks/useVideoCompression'
import { useVideoPlayer } from './hooks/useVideoPlayer'

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const {
    cancelCompression,
    clipEnd,
    clipStart,
    codec,
    clearVideo,
    compressVideo,
    compressionResult,
    isCancelling,
    isCompressing,
    isSelectingVideo,
    message,
    openResultFolder,
    progress,
    selectDroppedVideo,
    selectVideo,
    setClipEnd,
    setClipStart,
    setCodec,
    setTargetSizeMB,
    setUseTwoPass,
    status,
    targetSizeMB,
    useTwoPass,
    videoInfo,
  } = useVideoCompression()
  const player = useVideoPlayer({
    clipEnd,
    clipStart,
    videoRef,
  })

  const isCompressDisabled =
    !videoInfo || Number(targetSizeMB) >= videoInfo.sizeMB
  const messageTone =
    status === 'success'
      ? 'success'
      : status === 'error' || status === 'cancelled'
        ? 'error'
        : 'info'

  const resetTrim = () => {
    if (!videoInfo) return

    setClipStart(0)
    setClipEnd(videoInfo.duration)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }

  const handleCompressButtonClick = () => {
    if (isCompressing) {
      void cancelCompression()
      return
    }

    void compressVideo()
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_34%),linear-gradient(135deg,#071923_0%,#0a222b_48%,#061116_100%)] px-4 py-4 text-foreground sm:px-5 lg:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3">
        <header className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-normal text-foreground sm:text-2xl">
              Video Compressor
            </h1>
          </div>
        </header>

        {message && (
          <section
            className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm shadow-soft ${
              messageTone === 'success'
                ? 'border-primary/50 bg-primary/10 text-foreground'
                : messageTone === 'error'
                  ? 'border-destructive/50 bg-destructive/10 text-foreground'
                  : 'border-border bg-card text-foreground'
            }`}
          >
            {messageTone === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            ) : messageTone === 'error' ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            ) : (
              <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
            )}
            <span className="min-w-0 break-words">{message}</span>
          </section>
        )}

        <section
          className={
            videoInfo
              ? 'grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]'
              : 'grid gap-3'
          }
        >
          <div className={videoInfo ? 'flex min-w-0 flex-col gap-3' : 'mx-auto flex w-full max-w-3xl flex-col gap-3'}>
            {videoInfo ? (
              <VideoPreview
                clipEnd={clipEnd}
                clipStart={clipStart}
                currentTime={player.currentTime}
                duration={player.duration || videoInfo.duration}
                isClearDisabled={isCompressing}
                isPlaying={player.isPlaying}
                onClipEndChange={setClipEnd}
                onClipStartChange={setClipStart}
                onClearVideo={clearVideo}
                onResetTrim={resetTrim}
                onTogglePlayback={player.togglePlayback}
                videoInfo={videoInfo}
                videoRef={videoRef}
              />
            ) : (
              <VideoDropzone
                error={status === 'error' ? message : null}
                isLoading={isSelectingVideo}
                onDropVideo={selectDroppedVideo}
                onSelectVideo={selectVideo}
              />
            )}
          </div>

          {videoInfo && (
            <aside className="flex flex-col gap-3">
              <section className="rounded-lg border border-border bg-card p-4 shadow-soft">
                <div className="mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-semibold">Compression</h2>
                </div>

                <div className="flex flex-col gap-3">
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
                    className="w-full"
                    disabled={isCompressDisabled || isCancelling}
                    onClick={handleCompressButtonClick}
                    variant={isCompressing ? 'outline' : 'default'}
                  >
                    {isCompressing ? <Square /> : <Play />}
                    {isCompressing
                      ? isCancelling
                        ? 'Cancelling...'
                        : 'Cancel'
                      : 'Compress'}
                  </Button>

                  <CompressionProgress progress={progress} />
                </div>
              </section>

              {compressionResult && (
                <CompressionResult onOpenFolder={openResultFolder} />
              )}
            </aside>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
