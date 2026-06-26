import { useRef, useState } from 'react'
import './App.css'
import {
  Play,
  SlidersHorizontal,
  Square,
} from 'lucide-react'
import { AppToast } from './components/AppToast'
import { AppTitleBar } from './components/AppTitleBar'
import { CodecSelect } from './components/CodecSelect'
import { ExportProgress } from './components/ExportProgress'
import { ExportResult } from './components/ExportResult'
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
  const [isVideoLeaving, setIsVideoLeaving] = useState(false)
  const {
    cancelVideoOperation,
    clipEnd,
    clipStart,
    codec,
    clearVideo,
    compressVideo,
    dismissMessage,
    exportKind,
    exportResult,
    isCancelling,
    isCompressing,
    isSelectingVideo,
    isTrimming,
    isVideoOperationActive,
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
    trimVideo,
    useTwoPass,
    videoInfo,
  } = useVideoCompression()
  const player = useVideoPlayer({
    clipEnd,
    clipStart,
    sourceKey: videoInfo?.videoUrl,
    videoRef,
  })

  const numericTargetSizeMB = Number(targetSizeMB)
  const isTargetSizeInvalid = videoInfo
    ? !Number.isFinite(numericTargetSizeMB) ||
      numericTargetSizeMB <= 0 ||
      numericTargetSizeMB >= videoInfo.sizeMB
    : false
  const selectedClipDuration = clipEnd - clipStart
  const isTrimRangeInvalid = selectedClipDuration < 1
  const isCompressDisabled =
    !videoInfo ||
    isTargetSizeInvalid ||
    isTrimRangeInvalid ||
    (isVideoOperationActive && !isCompressing)
  const isTrimDisabled =
    !videoInfo ||
    isTrimRangeInvalid ||
    (isVideoOperationActive && !isTrimming)
  const hasCompressionResult =
    exportKind === 'compression' && Boolean(exportResult)
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

  const handleClearVideo = () => {
    if (isVideoOperationActive || isVideoLeaving) return

    setIsVideoLeaving(true)
    window.setTimeout(() => {
      clearVideo()
      setIsVideoLeaving(false)
    }, 220)
  }

  const handleCompressButtonClick = () => {
    if (isCompressing) {
      void cancelVideoOperation()
      return
    }

    void compressVideo()
  }

  const handleTrimButtonClick = () => {
    void trimVideo()
  }

  return (
    <>
      <AppTitleBar />
      <AppToast
        message={message}
        onClose={dismissMessage}
        tone={messageTone}
      />
      <main className="app-scrollbar box-border h-[calc(100vh-2.25rem)] overflow-x-hidden overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.24),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(88,28,135,0.22),transparent_34%),linear-gradient(135deg,#020204_0%,#070611_46%,#030207_100%)] px-4 py-3 text-foreground lg:overflow-hidden sm:px-5 lg:px-6">
      <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-3 lg:h-full lg:overflow-hidden">
        <section
          className={
            videoInfo
              ? 'grid min-h-full gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_320px]'
              : 'grid min-h-full justify-items-center gap-3 lg:min-h-0 lg:flex-1'
          }
        >
          <div
            className={
              videoInfo
                ? cn(
                    'app-panel-enter flex min-w-0 flex-col gap-3 lg:min-h-0',
                    isVideoLeaving && 'app-panel-exit',
                  )
                : 'app-panel-enter flex min-h-[calc(100vh-4.75rem)] w-full max-w-3xl flex-col justify-center gap-3 lg:min-h-0'
            }
          >
            {videoInfo ? (
              <VideoPreview
                clipEnd={clipEnd}
                clipStart={clipStart}
                currentTime={player.currentTime}
                duration={player.duration || videoInfo.duration}
                isClearDisabled={isVideoOperationActive || isVideoLeaving}
                isMuted={player.isMuted}
                isPlaying={player.isPlaying}
                isTrimDisabled={isTrimDisabled}
                isTrimming={isTrimming}
                onChangeVolume={player.changeVolume}
                onClipEndChange={setClipEnd}
                onClipStartChange={setClipStart}
                onClearVideo={handleClearVideo}
                onPreviewError={showPreviewError}
                onResetTrim={resetTrim}
                onTrim={handleTrimButtonClick}
                onToggleMute={player.toggleMute}
                onTogglePlayback={player.togglePlayback}
                videoInfo={videoInfo}
                videoRef={videoRef}
                volume={player.volume}
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
            <aside
              className={cn(
                'app-panel-enter app-panel-enter-delay flex flex-col gap-3 lg:min-h-0 lg:overflow-hidden',
                isVideoLeaving && 'app-panel-exit',
              )}
            >
              <section
                className={cn(
                  'relative overflow-hidden rounded-lg border border-border/80 bg-card/85 p-4 shadow-soft backdrop-blur transition-colors',
                  isVideoOperationActive && 'compression-panel-active border-primary/35',
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

                  <div>
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
                  </div>

                  <ExportProgress
                    isComplete={hasCompressionResult}
                    progress={progress}
                  />
                </div>
              </section>

              {exportResult && exportKind && (
                <ExportResult
                  kind={exportKind}
                  onOpenFolder={openResultFolder}
                />
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
