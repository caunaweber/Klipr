import { useRef } from 'react'
import './App.css'
import {
  Play,
  SlidersHorizontal,
  Square,
} from 'lucide-react'
import { AppToast } from './components/AppToast'
import { AppTitleBar } from './components/AppTitleBar'
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
import { cn } from './lib/utils'

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
    dismissMessage,
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
    showPreviewError,
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

  const numericTargetSizeMB = Number(targetSizeMB)
  const isTargetSizeInvalid = videoInfo
    ? !Number.isFinite(numericTargetSizeMB) ||
      numericTargetSizeMB <= 0 ||
      numericTargetSizeMB >= videoInfo.sizeMB
    : false
  const isCompressDisabled = !videoInfo || isTargetSizeInvalid
  const messageTone =
    status === 'success'
      ? 'success'
      : status === 'error'
        ? 'error'
        : status === 'cancelled'
          ? 'neutral'
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
    <>
      <AppTitleBar />
      <AppToast
        message={message}
        onClose={dismissMessage}
        tone={messageTone}
      />
      <main className="box-border h-[calc(100vh-2.25rem)] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(88,28,135,0.22),transparent_34%),linear-gradient(135deg,#020204_0%,#070611_46%,#030207_100%)] px-4 py-3 text-foreground sm:px-5 lg:px-6">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-3 overflow-hidden">
        <section
          className={
            videoInfo
              ? 'grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]'
              : 'grid min-h-0 flex-1 gap-3'
          }
        >
          <div className={videoInfo ? 'app-panel-enter flex min-h-0 min-w-0 flex-col gap-3' : 'app-panel-enter mx-auto flex min-h-0 w-full max-w-3xl flex-col justify-center gap-3'}>
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
                onPreviewError={showPreviewError}
                onResetTrim={resetTrim}
                onTogglePlayback={player.togglePlayback}
                videoInfo={videoInfo}
                videoRef={videoRef}
              />
            ) : (
              <VideoDropzone
                error={null}
                isLoading={isSelectingVideo}
                onDropVideo={selectDroppedVideo}
                onSelectVideo={selectVideo}
              />
            )}
          </div>

          {videoInfo && (
            <aside className="app-panel-enter app-panel-enter-delay flex min-h-0 flex-col gap-3 overflow-hidden">
              <section
                className={cn(
                  'relative overflow-hidden rounded-lg border border-border/80 bg-card/85 p-4 shadow-soft backdrop-blur transition-colors',
                  isCompressing && 'compression-panel-active border-primary/35',
                )}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-foreground">
                      Compression
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Output settings
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <CodecSelect codec={codec} onCodecChange={setCodec} />
                  <TwoPassToggle
                    checked={useTwoPass}
                    onCheckedChange={setUseTwoPass}
                  />
                  <TargetSizeInput
                    sourceSizeMB={videoInfo.sizeMB}
                    value={targetSizeMB}
                    onValueChange={setTargetSizeMB}
                  />

                  <Button
                    className={cn(
                      'compress-action-button group w-full overflow-hidden',
                      isCompressing
                        ? 'border-primary/50 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
                        : 'bg-[linear-gradient(135deg,hsl(var(--primary))_0%,#7c3aed_52%,#2563eb_100%)] shadow-glow hover:shadow-[0_0_42px_rgb(124_58_237_/_0.34)]',
                    )}
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
    </>
  )
}

export default App
