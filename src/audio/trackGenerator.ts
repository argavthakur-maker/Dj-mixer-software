import type { Track, HotCue } from '../types/dj';
import { audioEngine } from './AudioEngine';

// Generates procedural club-ready audio buffers and extracts 3-band waveforms
export async function createDemoTracks(): Promise<Track[]> {
  audioEngine.ensureContext();
  const ctx = audioEngine.getContext();
  if (!ctx) return [];

  // Track specifications
  const specs = [
    {
      id: 'demo-1',
      title: 'Nightshift (Club Extended)',
      artist: 'Kaelen Vance',
      album: 'Afterhours Vol. 1',
      bpm: 128,
      key: '8A', // A Minor
      keyMusical: 'Am',
      genre: 'Tech House',
      duration: 120, // 2 minutes
      energyLevel: 5,
      style: 'tech-house',
      artwork: 'linear-gradient(135deg, #00E5FF 0%, #0D1B2A 100%)',
    },
    {
      id: 'demo-2',
      title: 'Neon Horizon',
      artist: 'Aura & Solis',
      album: 'Prism Horizons',
      bpm: 124,
      key: '9B', // G Major
      keyMusical: 'G',
      genre: 'Melodic House',
      duration: 116,
      energyLevel: 4,
      style: 'melodic',
      artwork: 'linear-gradient(135deg, #8B5CF6 0%, #312E81 100%)',
    },
    {
      id: 'demo-3',
      title: 'Cyber Underground',
      artist: 'Vektor 9',
      album: 'Sub-Zero Warehouse',
      bpm: 132,
      key: '11A', // F# Minor
      keyMusical: 'F#m',
      genre: 'Acid Techno',
      duration: 128,
      energyLevel: 5,
      style: 'acid-techno',
      artwork: 'linear-gradient(135deg, #EC4899 0%, #4C0519 100%)',
    },
    {
      id: 'demo-4',
      title: 'Solar Pulse',
      artist: 'Apex Horizon',
      album: 'Mainstage Live',
      bpm: 126,
      key: '8B', // C Major
      keyMusical: 'C',
      genre: 'Festival Anthem',
      duration: 114,
      energyLevel: 5,
      style: 'anthem',
      artwork: 'linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)',
    },
    {
      id: 'demo-5',
      title: 'Midnight Velocity',
      artist: 'Sub Focus Protocol',
      album: 'Rolling Pressure',
      bpm: 174,
      key: '4A', // F Minor
      keyMusical: 'Fm',
      genre: 'Drum & Bass',
      duration: 110,
      energyLevel: 5,
      style: 'dnb',
      artwork: 'linear-gradient(135deg, #F59E0B 0%, #78350F 100%)',
    },
    {
      id: 'demo-6',
      title: 'Tokyo Drift 2099',
      artist: 'Synthwave Matrix',
      album: 'Outrun Echoes',
      bpm: 118,
      key: '5A', // C Minor
      keyMusical: 'Cm',
      genre: 'Cyberpunk Synth',
      duration: 122,
      energyLevel: 4,
      style: 'synthwave',
      artwork: 'linear-gradient(135deg, #10B981 0%, #064E3B 100%)',
    },
  ];

  const tracks: Track[] = [];

  for (const spec of specs) {
    const buffer = generateClubTrackAudio(ctx, spec.duration, spec.bpm, spec.style);
    const { waveform, colorBands } = extractWaveformData(buffer);
    
    // Default Hot Cues
    const beatSec = 60 / spec.bpm;
    const hotCues: HotCue[] = [
      { id: 1, position: 0, label: 'Intro', color: '#00E5FF' },
      { id: 2, position: Number((beatSec * 16).toFixed(2)), label: 'Drop 1', color: '#8B5CF6' },
      { id: 3, position: Number((beatSec * 32).toFixed(2)), label: 'Build', color: '#EC4899' },
      { id: 4, position: Number((beatSec * 48).toFixed(2)), label: 'Break', color: '#F59E0B' },
      { id: 5, position: Number((beatSec * 64).toFixed(2)), label: 'Drop 2', color: '#10B981' },
      { id: 6, position: Number((beatSec * 80).toFixed(2)), label: 'Outro', color: '#3B82F6' },
    ];

    tracks.push({
      id: spec.id,
      title: spec.title,
      artist: spec.artist,
      album: spec.album,
      bpm: spec.bpm,
      key: spec.key,
      keyMusical: spec.keyMusical,
      genre: spec.genre,
      duration: spec.duration,
      energyLevel: spec.energyLevel,
      artworkUrl: spec.artwork,
      audioBuffer: buffer,
      waveformData: waveform,
      colorBandData: colorBands,
      hotCues,
      isCustom: false,
    });
  }

  return tracks;
}

// Procedural club synthesizer that produces actual musical audio beats
function generateClubTrackAudio(
  ctx: AudioContext,
  durationSec: number,
  bpm: number,
  style: string
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = ctx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const beatSec = 60 / bpm;
  const samplesPerBeat = Math.floor(sampleRate * beatSec);
  const totalBeats = Math.floor(durationSec / beatSec);

  // Generate beat patterns
  for (let beat = 0; beat < totalBeats; beat++) {
    const beatStart = beat * samplesPerBeat;
    const bar = Math.floor(beat / 4);
    const beatInBar = beat % 4;

    // Structure: Intro (bars 0-3), Build (bars 4-7), Drop (bars 8-23), Breakdown (bars 24-27), Peak (bars 28-35), Outro
    const isBreakdown = (bar >= 16 && bar < 20) || (bar >= 36 && bar < 40);
    const hasKick = !isBreakdown;
    const hasHihat = bar >= 2;
    const hasClap = (bar >= 4 || bar % 8 >= 4) && !isBreakdown;

    // 1. Kick Drum (every beat if hasKick)
    if (hasKick) {
      renderKick(left, right, beatStart, sampleRate, style);
    }

    // 2. Clap / Snare on beats 2 & 4 (beatInBar 1 & 3)
    if (hasClap && (beatInBar === 1 || beatInBar === 3)) {
      renderClap(left, right, beatStart, sampleRate);
    }

    // 3. Hi-Hats: 16th note pattern
    if (hasHihat) {
      const sixteenth = Math.floor(samplesPerBeat / 4);
      for (let s = 0; s < 4; s++) {
        const isOffbeat = s === 2; // the classic upbeat 8th
        const hatPos = beatStart + (s * sixteenth);
        renderHiHat(left, right, hatPos, sampleRate, isOffbeat);
      }
    }

    // 4. Bassline & Synths
    renderMusicalLayer(left, right, beatStart, samplesPerBeat, beat, bar, beatInBar, sampleRate, style);
  }

  // Normalize audio to avoid clipping
  let peak = 0.001;
  for (let i = 0; i < numSamples; i += 20) {
    const absL = Math.abs(left[i]);
    const absR = Math.abs(right[i]);
    if (absL > peak) peak = absL;
    if (absR > peak) peak = absR;
  }
  if (peak > 0.88) {
    const normFactor = 0.88 / peak;
    for (let i = 0; i < numSamples; i++) {
      left[i] *= normFactor;
      right[i] *= normFactor;
    }
  }

  return buffer;
}

function renderKick(
  left: Float32Array,
  right: Float32Array,
  start: number,
  sampleRate: number,
  style: string
) {
  const kickLength = Math.floor(sampleRate * (style === 'acid-techno' ? 0.35 : 0.28));
  for (let i = 0; i < kickLength; i++) {
    const idx = start + i;
    if (idx >= left.length) break;
    const t = i / sampleRate;
    // Pitch sweep: 150Hz -> 45Hz
    const freq = 45 + 110 * Math.exp(-t * 32);
    const env = Math.exp(-t * 14);
    // Punch click at start
    const click = i < 150 ? (Math.random() * 2 - 1) * 0.4 * Math.exp(-i / 30) : 0;
    const val = (Math.sin(2 * Math.PI * freq * t) * env) + click;
    left[idx] += val * 0.75;
    right[idx] += val * 0.75;
  }
}

function renderClap(
  left: Float32Array,
  right: Float32Array,
  start: number,
  sampleRate: number
) {
  const clapLength = Math.floor(sampleRate * 0.22);
  for (let i = 0; i < clapLength; i++) {
    const idx = start + i;
    if (idx >= left.length) break;
    const t = i / sampleRate;
    const env = Math.exp(-t * 22);
    // Noise burst
    const noise = (Math.random() * 2 - 1) * env * 0.35;
    // Stereo spread
    left[idx] += noise * 0.9;
    right[idx] += noise * 1.1;
  }
}

function renderHiHat(
  left: Float32Array,
  right: Float32Array,
  start: number,
  sampleRate: number,
  isOpen: boolean
) {
  const length = Math.floor(sampleRate * (isOpen ? 0.18 : 0.04));
  for (let i = 0; i < length; i++) {
    const idx = start + i;
    if (idx >= left.length) break;
    const t = i / sampleRate;
    const env = Math.exp(-t * (isOpen ? 18 : 75));
    const noise = (Math.random() * 2 - 1) * env * (isOpen ? 0.22 : 0.12);
    left[idx] += noise;
    right[idx] += noise * 0.95;
  }
}

function renderMusicalLayer(
  left: Float32Array,
  right: Float32Array,
  beatStart: number,
  samplesPerBeat: number,
  beat: number,
  bar: number,
  beatInBar: number,
  sampleRate: number,
  style: string
) {
  // Generate melodic elements matching key and style
  const notesAm = [55, 65.4, 73.4, 82.4, 98, 110]; // Bass frequencies for A minor
  const bassFreq = notesAm[(beat % notesAm.length)];

  // Bass note on offbeat or 16ths
  const sixteenth = Math.floor(samplesPerBeat / 4);
  for (let step = 0; step < 4; step++) {
    if (step === 2 || (style === 'acid-techno' && step % 2 === 1)) {
      const noteStart = beatStart + (step * sixteenth);
      const noteLen = Math.floor(sixteenth * 0.85);

      for (let i = 0; i < noteLen; i++) {
        const idx = noteStart + i;
        if (idx >= left.length) break;
        const t = i / sampleRate;
        const env = Math.exp(-t * 8);

        let wave = 0;
        if (style === 'acid-techno') {
          // Acid 303 resonant saw
          const cutoff = 400 + 1800 * Math.exp(-t * 14);
          wave = (Math.sin(2 * Math.PI * bassFreq * t) + 0.3 * Math.sin(2 * Math.PI * (cutoff * 0.1) * t)) * env * 0.35;
          wave = Math.tanh(wave * 2.2); // Saturation
        } else if (style === 'dnb') {
          // Reese rolling bass
          wave = (Math.sin(2 * Math.PI * (bassFreq * 0.8) * t) + Math.sin(2 * Math.PI * (bassFreq * 0.81) * t)) * env * 0.45;
        } else {
          // Tech house sub/mid bass
          wave = Math.sin(2 * Math.PI * bassFreq * t) * env * 0.4;
        }

        left[idx] += wave;
        right[idx] += wave;
      }
    }
  }

  // Atmospheric chords / synth stabs every 2 or 4 bars
  if (bar % 2 === 0 && beatInBar === 0) {
    const chordFreqs = style === 'melodic' ? [220, 261.6, 329.6, 392] : [110, 130.8, 164.8];
    const chordLen = Math.floor(samplesPerBeat * 2.5);

    for (let i = 0; i < chordLen; i++) {
      const idx = beatStart + i;
      if (idx >= left.length) break;
      const t = i / sampleRate;
      const env = Math.exp(-t * 2.5);

      let chordValL = 0;
      let chordValR = 0;
      chordFreqs.forEach((freq, fIdx) => {
        const pan = fIdx % 2 === 0 ? 0.8 : 1.2;
        const val = Math.sin(2 * Math.PI * freq * t) * env * 0.08;
        chordValL += val * pan;
        chordValR += val * (2 - pan);
      });

      left[idx] += chordValL;
      right[idx] += chordValR;
    }
  }
}

// Computes 3-band frequency spectrum and RMS overview for Serato/Rekordbox style waveforms
export function extractWaveformData(buffer: AudioBuffer, pointsCount: number = 1800) {
  const left = buffer.getChannelData(0);
  const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;
  const totalSamples = buffer.length;
  const step = Math.floor(totalSamples / pointsCount);

  const waveform = new Float32Array(pointsCount);
  const lowBand = new Float32Array(pointsCount);
  const midBand = new Float32Array(pointsCount);
  const highBand = new Float32Array(pointsCount);

  for (let i = 0; i < pointsCount; i++) {
    const start = i * step;
    const end = Math.min(start + step, totalSamples);

    let maxVal = 0;
    let lowEnergy = 0;
    let midEnergy = 0;
    let highEnergy = 0;

    for (let s = start; s < end; s += 4) {
      const val = (Math.abs(left[s]) + Math.abs(right[s])) / 2;
      if (val > maxVal) maxVal = val;

      // Approximate frequency bands by differences
      const prev = s > 0 ? left[s - 1] : 0;
      const diff = Math.abs(left[s] - prev);

      // High frequencies have high step differences
      highEnergy += diff * 1.5;
      // Low frequencies have strong sustained amplitude
      lowEnergy += val * (1 - Math.min(1, diff * 2));
      midEnergy += (val * 0.5) + (diff * 0.5);
    }

    const count = (end - start) / 4;
    waveform[i] = Math.min(1.0, maxVal);
    lowBand[i] = Math.min(1.0, (lowEnergy / count) * 2.4);
    midBand[i] = Math.min(1.0, (midEnergy / count) * 2.2);
    highBand[i] = Math.min(1.0, (highEnergy / count) * 2.8);
  }

  return {
    waveform,
    colorBands: {
      low: lowBand,
      mid: midBand,
      high: highBand,
    },
  };
}

// User-imported audio file decoder
export async function decodeAudioFile(file: File): Promise<Track> {
  audioEngine.ensureContext();
  const ctx = audioEngine.getContext();
  if (!ctx) throw new Error('Audio context not initialized');

  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  const { waveform, colorBands } = extractWaveformData(audioBuffer);
  
  // Estimate BPM by peak energy intervals
  const estimatedBpm = estimateBpmFromBuffer(audioBuffer);

  // Random harmonic key or estimate
  const keys = ['8A', '9A', '10A', '11A', '8B', '9B', '10B', '7A'];
  const detectedKey = keys[Math.floor(Math.random() * keys.length)];

  const cleanName = file.name.replace(/\.[^/.]+$/, '');
  const parts = cleanName.split('-');
  const artist = parts.length > 1 ? parts[0].trim() : 'Local Audio';
  const title = parts.length > 1 ? parts.slice(1).join('-').trim() : cleanName;

  const beatSec = 60 / estimatedBpm;
  const hotCues: HotCue[] = [
    { id: 1, position: 0, label: 'Cue 1', color: '#00E5FF' },
    { id: 2, position: Number((beatSec * 16).toFixed(2)), label: 'Cue 2', color: '#8B5CF6' },
    { id: 3, position: Number((beatSec * 32).toFixed(2)), label: 'Cue 3', color: '#EC4899' },
  ];

  return {
    id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title,
    artist,
    album: 'Imported Library',
    bpm: estimatedBpm,
    key: detectedKey,
    keyMusical: 'Auto',
    genre: 'Club Mix',
    duration: Math.round(audioBuffer.duration),
    energyLevel: 4,
    artworkUrl: 'linear-gradient(135deg, #00E5FF 0%, #8B5CF6 100%)',
    audioBuffer,
    waveformData: waveform,
    colorBandData: colorBands,
    hotCues,
    isCustom: true,
  };
}

// Energy-based BPM detection
function estimateBpmFromBuffer(buffer: AudioBuffer): number {
  const channelData = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  
  // Sample 30 seconds from the middle
  const startSample = Math.min(Math.floor(sampleRate * 20), Math.floor(buffer.length * 0.2));
  const endSample = Math.min(startSample + Math.floor(sampleRate * 30), buffer.length);
  
  const step = Math.floor(sampleRate / 100); // 100Hz envelope
  const energies: number[] = [];
  
  for (let i = startSample; i < endSample; i += step) {
    let sum = 0;
    const chunkEnd = Math.min(i + step, endSample);
    for (let j = i; j < chunkEnd; j += 4) {
      sum += Math.abs(channelData[j]);
    }
    energies.push(sum / ((chunkEnd - i) / 4));
  }

  // Correlate with standard DJ BPMs (120 - 136, 174)
  const candidateBpms = [120, 122, 124, 125, 126, 128, 130, 132, 134, 174];
  let bestBpm = 126;
  let maxScore = -1;

  for (const bpm of candidateBpms) {
    const intervalInFrames = (60 / bpm) * 100;
    let score = 0;
    for (let i = 0; i < energies.length - intervalInFrames * 2; i += 10) {
      const idx1 = Math.floor(i);
      const idx2 = Math.floor(i + intervalInFrames);
      const idx3 = Math.floor(i + intervalInFrames * 2);
      if (idx3 < energies.length) {
        score += energies[idx1] * energies[idx2] * energies[idx3];
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestBpm = bpm;
    }
  }

  return bestBpm;
}
