import { describe, expect, it } from 'vitest'
import { buildAudioMappingArguments } from '../../../electron/utils/audio-arguments.utils'

describe('buildAudioMappingArguments', () => {
  it('keeps video-only inputs valid', () => {
    expect(
      buildAudioMappingArguments({
        audioTracksCount: 0,
        copyVideo: false,
        singleTrackAudioCodec: 'aac',
      }),
    ).toEqual([
      '-map',
      '0:v:0',
      '-map',
      '0:a:0?',
      '-c:a',
      'aac',
    ])
  })

  it('copies the primary video and a single audio track when trimming', () => {
    expect(
      buildAudioMappingArguments({
        audioTracksCount: 1,
        copyVideo: true,
        singleTrackAudioCodec: 'copy',
      }),
    ).toEqual([
      '-map',
      '0:v:0',
      '-map',
      '0:a:0?',
      '-c:v',
      'copy',
      '-c:a',
      'copy',
    ])
  })

  it('normalizes and mixes multiple audio tracks into stereo', () => {
    expect(
      buildAudioMappingArguments({
        audioTracksCount: 2,
        copyVideo: true,
        singleTrackAudioCodec: 'copy',
      }),
    ).toEqual([
      '-filter_complex',
      '[0:a:0]aformat=sample_fmts=fltp:channel_layouts=stereo[a0];' +
        '[0:a:1]aformat=sample_fmts=fltp:channel_layouts=stereo[a1];' +
        '[a0][a1]amix=inputs=2:duration=longest:normalize=1[a]',
      '-map',
      '0:v:0',
      '-map',
      '[a]',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-ac',
      '2',
    ])
  })
})
