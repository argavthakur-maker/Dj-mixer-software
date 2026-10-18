export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  bpm: number;
  key: string; // Camelot key e.g. "8A"
  keyMusical?: string; // Musical key e.g. "Am"
  duration: number; // in seconds
  genre: string;
  year?: number;
  artworkUrl?: string;
  audioBuffer?: AudioBuffer;
  waveformData?: Float32Array; // RMS peaks for waveform rendering
  colorBandData?: {
    low: Float32Array;
    mid: Float32Array;
    high: Float32Array;
  };
  hotCues?: HotCue[];
  energyLevel?: number; // 1 to 5
  isCustom?: boolean;
}

export interface HotCue {
  id: number; // 1 to 8
  position: number; // in seconds
  label: string;
  color: string;
}

export interface LoopState {
  active: boolean;
  start: number; // in seconds
  end: number; // in seconds
  lengthInBeats: number;
}

export interface DeckState {
  id: 'A' | 'B';
  track: Track | null;
  isPlaying: boolean;
  currentTime: number; // current playhead position in seconds
  cuePosition: number; // primary CUE point in seconds
  bpm: number; // base BPM
  currentBpm: number; // BPM with pitch fader applied
  pitchPercent: number; // -50 to +50%
  pitchRange: 8 | 16 | 50; // pitch slider range
  isKeyLocked: boolean; // Master tempo / key lock
  isSync: boolean;
  isMaster: boolean;
  isSlipMode: boolean;
  isQuantize: boolean;
  loop: LoopState;
  hotCues: HotCue[];
  activePadMode: 'hotcue' | 'padfx' | 'beatjump' | 'sampler';
  isScratching: boolean;
  vinylMode: boolean;
  scratchAngle: number; // in degrees for turntable visual rotation
  volumeLevel: number; // current dynamic VU meter level 0.0 to 1.0
}

export interface ChannelMixerState {
  gain: number; // -12dB to +12dB (0 = 1.0)
  eqHigh: number; // -26dB to +6dB (0dB = 1.0)
  eqMid: number; // -26dB to +6dB
  eqLow: number; // -26dB to +6dB
  killHigh: boolean;
  killMid: boolean;
  killLow: boolean;
  filter: number; // -1.0 (LPF) to 0.0 (neutral) to +1.0 (HPF)
  faderVolume: number; // 0.0 to 1.0
  cueHeadphone: boolean; // PFL monitor
  meterLeft: number; // 0.0 to 1.0
  meterRight: number; // 0.0 to 1.0
}

export interface MixerState {
  masterVolume: number; // 0.0 to 1.0
  boothVolume: number;
  headphoneVolume: number;
  headphoneMix: number; // 0.0 (Cue) to 1.0 (Master)
  crossfader: number; // -1.0 (Deck A) to 0.0 (Center) to +1.0 (Deck B)
  crossfaderCurve: 'smooth' | 'linear' | 'scratch';
  crossfaderReverse: boolean; // Hamster switch
  deckAAssign: 'A' | 'THRU' | 'B';
  deckBAssign: 'A' | 'THRU' | 'B';
  masterMeterL: number;
  masterMeterR: number;
}

export interface SamplerPad {
  id: number;
  name: string;
  category: 'drum' | 'fx' | 'vocal' | 'synth';
  color: string;
  isPlaying: boolean;
}

export type WaveformViewMode = 'stacked' | 'side-by-side' | 'minimal';
export type AppViewMode = 'performance' | 'library' | 'split';

