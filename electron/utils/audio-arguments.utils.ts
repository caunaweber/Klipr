interface AudioMappingOptions {
  audioTracksCount: number
  copyVideo: boolean
  singleTrackAudioCodec: 'aac' | 'copy'
}

export function buildAudioMappingArguments({
  audioTracksCount,
  copyVideo,
  singleTrackAudioCodec,
}: AudioMappingOptions): string[] {
  const videoCodecArguments = copyVideo
    ? ['-c:v', 'copy']
    : []

  if (audioTracksCount <= 1) {
    return [
      '-map',
      '0:v:0',
      '-map',
      '0:a:0?',
      ...videoCodecArguments,
      '-c:a',
      singleTrackAudioCodec,
    ]
  }

  const normalizedInputs = Array.from(
    { length: audioTracksCount },
    (_, index) =>
      `[0:a:${index}]aformat=sample_fmts=fltp:channel_layouts=stereo[a${index}]`,
  )
  const inputLinks = Array.from(
    { length: audioTracksCount },
    (_, index) => `[a${index}]`,
  ).join('')
  const filterGraph = [
    ...normalizedInputs,
    `${inputLinks}amix=inputs=${audioTracksCount}:duration=longest:normalize=1[a]`,
  ].join(';')

  return [
    '-filter_complex',
    filterGraph,
    '-map',
    '0:v:0',
    '-map',
    '[a]',
    ...videoCodecArguments,
    '-c:a',
    'aac',
    '-ac',
    '2',
  ]
}
