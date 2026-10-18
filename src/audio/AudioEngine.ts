import type { Track, LoopState } from '../types/dj';

// DJ Audio Engine managing Web Audio API graph, analysis, loops, scratch, and recording
export class AudioEngine {
  private ctx: AudioContext | null = null;

  // Deck A nodes
  private deckASource: AudioBufferSourceNode | null = null;
  private deckAGain: GainNode | null = null;
  private deckATrim: GainNode | null = null;
  private deckAEqLow: BiquadFilterNode | null = null;
  private deckAEqMid: BiquadFilterNode | null = null;
  private deckAEqHigh: BiquadFilterNode | null = null;
  private deckAFilter: BiquadFilterNode | null = null;
  private deckACrossGain: GainNode | null = null;
  private deckAAnalyser: AnalyserNode | null = null;

  // Deck B nodes
  private deckBSource: AudioBufferSourceNode | null = null;
  private deckBGain: GainNode | null = null;
  private deckBTrim: GainNode | null = null;
  private deckBEqLow: BiquadFilterNode | null = null;
  private deckBEqMid: BiquadFilterNode | null = null;
  private deckBEqHigh: BiquadFilterNode | null = null;
  private deckBFilter: BiquadFilterNode | null = null;
  private deckBCrossGain: GainNode | null = null;
  private deckBAnalyser: AnalyserNode | null = null;

  // Master & Recording nodes
  private masterGain: GainNode | null = null;
  private masterAnalyser: AnalyserNode | null = null;
  private recordDest: MediaStreamAudioDestinationNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  private recordStartTime: number = 0;

  // Playback tracking
  private deckAStartTime: number = 0;
  private deckAPauseOffset: number = 0;
  private deckAPlaying: boolean = false;
  private deckARate: number = 1.0;

  private deckBStartTime: number = 0;
  private deckBPauseOffset: number = 0;
  private deckBPlaying: boolean = false;
  private deckBRate: number = 1.0;

  private deckATrack: Track | null = null;
  private deckBTrack: Track | null = null;

  constructor() {
    // Lazy initialization on first user interaction
  }

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 256;
    this.masterAnalyser.smoothingTimeConstant = 0.8;

    this.masterGain.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.ctx.destination);

    // Live Recording destination
    if (this.ctx.createMediaStreamDestination) {
      this.recordDest = this.ctx.createMediaStreamDestination();
      this.masterGain.connect(this.recordDest);
    }

    // Initialize Deck A graph
    this.deckAAnalyser = this.ctx.createAnalyser();
    this.deckAAnalyser.fftSize = 128;
    this.deckAAnalyser.smoothingTimeConstant = 0.75;

    this.deckATrim = this.ctx.createGain();
    this.deckAEqLow = this.ctx.createBiquadFilter();
    this.deckAEqLow.type = 'lowshelf';
    this.deckAEqLow.frequency.value = 250;

    this.deckAEqMid = this.ctx.createBiquadFilter();
    this.deckAEqMid.type = 'peaking';
    this.deckAEqMid.frequency.value = 1200;
    this.deckAEqMid.Q.value = 1.2;

    this.deckAEqHigh = this.ctx.createBiquadFilter();
    this.deckAEqHigh.type = 'highshelf';
    this.deckAEqHigh.frequency.value = 3500;

    this.deckAFilter = this.ctx.createBiquadFilter();
    this.deckAFilter.type = 'allpass'; // neutral by default

    this.deckAGain = this.ctx.createGain();
    this.deckAGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    this.deckACrossGain = this.ctx.createGain();
    this.deckACrossGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Connect Deck A chain: Trim -> EqLow -> EqMid -> EqHigh -> Filter -> Gain -> Analyser -> CrossGain -> MasterGain
    this.deckATrim.connect(this.deckAEqLow);
    this.deckAEqLow.connect(this.deckAEqMid);
    this.deckAEqMid.connect(this.deckAEqHigh);
    this.deckAEqHigh.connect(this.deckAFilter);
    this.deckAFilter.connect(this.deckAGain);
    this.deckAGain.connect(this.deckAAnalyser);
    this.deckAAnalyser.connect(this.deckACrossGain);
    this.deckACrossGain.connect(this.masterGain);

    // Initialize Deck B graph
    this.deckBAnalyser = this.ctx.createAnalyser();
    this.deckBAnalyser.fftSize = 128;
    this.deckBAnalyser.smoothingTimeConstant = 0.75;

    this.deckBTrim = this.ctx.createGain();
    this.deckBEqLow = this.ctx.createBiquadFilter();
    this.deckBEqLow.type = 'lowshelf';
    this.deckBEqLow.frequency.value = 250;

    this.deckBEqMid = this.ctx.createBiquadFilter();
    this.deckBEqMid.type = 'peaking';
    this.deckBEqMid.frequency.value = 1200;
    this.deckBEqMid.Q.value = 1.2;

    this.deckBEqHigh = this.ctx.createBiquadFilter();
    this.deckBEqHigh.type = 'highshelf';
    this.deckBEqHigh.frequency.value = 3500;

    this.deckBFilter = this.ctx.createBiquadFilter();
    this.deckBFilter.type = 'allpass';

    this.deckBGain = this.ctx.createGain();
    this.deckBGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    this.deckBCrossGain = this.ctx.createGain();
    this.deckBCrossGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

    // Connect Deck B chain
    this.deckBTrim.connect(this.deckBEqLow);
    this.deckBEqLow.connect(this.deckBEqMid);
    this.deckBEqMid.connect(this.deckBEqHigh);
    this.deckBEqHigh.connect(this.deckBFilter);
    this.deckBFilter.connect(this.deckBGain);
    this.deckBGain.connect(this.deckBAnalyser);
    this.deckBAnalyser.connect(this.deckBCrossGain);
    this.deckBCrossGain.connect(this.masterGain);
  }

  public ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  // Track Loading
  public loadTrack(deck: 'A' | 'B', track: Track) {
    this.ensureContext();
    this.stop(deck);

    if (deck === 'A') {
      this.deckATrack = track;
      this.deckAPauseOffset = 0;
    } else {
      this.deckBTrack = track;
      this.deckBPauseOffset = 0;
    }
  }

  // Playback controls
  public play(deck: 'A' | 'B', offset?: number, loop?: LoopState) {
    this.ensureContext();
    if (!this.ctx) return;

    const track = deck === 'A' ? this.deckATrack : this.deckBTrack;
    if (!track || !track.audioBuffer) return;

    // Stop current source if active
    if (deck === 'A' && this.deckASource) {
      try { this.deckASource.stop(); this.deckASource.disconnect(); } catch (_) { /* ignore */ }
    } else if (deck === 'B' && this.deckBSource) {
      try { this.deckBSource.stop(); this.deckBSource.disconnect(); } catch (_) { /* ignore */ }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = track.audioBuffer;

    const rate = deck === 'A' ? this.deckARate : this.deckBRate;
    source.playbackRate.setValueAtTime(rate, this.ctx.currentTime);

    // Loop configuration
    if (loop && loop.active && loop.end > loop.start) {
      source.loop = true;
      source.loopStart = loop.start;
      source.loopEnd = loop.end;
    }

    const startPos = offset !== undefined 
      ? offset 
      : (deck === 'A' ? this.deckAPauseOffset : this.deckBPauseOffset);
    
    const boundedPos = Math.max(0, Math.min(startPos, track.duration - 0.05));

    if (deck === 'A') {
      source.connect(this.deckATrim!);
      this.deckASource = source;
      this.deckAStartTime = this.ctx.currentTime - (boundedPos / rate);
      this.deckAPauseOffset = boundedPos;
      this.deckAPlaying = true;
    } else {
      source.connect(this.deckBTrim!);
      this.deckBSource = source;
      this.deckBStartTime = this.ctx.currentTime - (boundedPos / rate);
      this.deckBPauseOffset = boundedPos;
      this.deckBPlaying = true;
    }

    source.start(0, boundedPos);
  }

  public pause(deck: 'A' | 'B') {
    if (!this.ctx) return;

    if (deck === 'A') {
      if (this.deckAPlaying) {
        this.deckAPauseOffset = this.getCurrentTime('A');
        if (this.deckASource) {
          try { this.deckASource.stop(); this.deckASource.disconnect(); } catch (_) { /* ignore */ }
          this.deckASource = null;
        }
        this.deckAPlaying = false;
      }
    } else {
      if (this.deckBPlaying) {
        this.deckBPauseOffset = this.getCurrentTime('B');
        if (this.deckBSource) {
          try { this.deckBSource.stop(); this.deckBSource.disconnect(); } catch (_) { /* ignore */ }
          this.deckBSource = null;
        }
        this.deckBPlaying = false;
      }
    }
  }

  public stop(deck: 'A' | 'B') {
    this.pause(deck);
    if (deck === 'A') {
      this.deckAPauseOffset = 0;
    } else {
      this.deckBPauseOffset = 0;
    }
  }

  public seek(deck: 'A' | 'B', time: number, loop?: LoopState) {
    const isPlaying = deck === 'A' ? this.deckAPlaying : this.deckBPlaying;
    const track = deck === 'A' ? this.deckATrack : this.deckBTrack;
    if (!track) return;

    const clampedTime = Math.max(0, Math.min(time, track.duration));
    if (isPlaying) {
      this.play(deck, clampedTime, loop);
    } else {
      if (deck === 'A') {
        this.deckAPauseOffset = clampedTime;
      } else {
        this.deckBPauseOffset = clampedTime;
      }
    }
  }

  public getCurrentTime(deck: 'A' | 'B'): number {
    if (!this.ctx) return 0;
    const track = deck === 'A' ? this.deckATrack : this.deckBTrack;
    if (!track) return 0;

    const isPlaying = deck === 'A' ? this.deckAPlaying : this.deckBPlaying;
    if (!isPlaying) {
      return deck === 'A' ? this.deckAPauseOffset : this.deckBPauseOffset;
    }

    const startTime = deck === 'A' ? this.deckAStartTime : this.deckBStartTime;
    const rate = deck === 'A' ? this.deckARate : this.deckBRate;
    const elapsed = (this.ctx.currentTime - startTime) * rate;

    return Math.max(0, Math.min(elapsed, track.duration));
  }

  // Pitch & Rate
  public setPlaybackRate(deck: 'A' | 'B', rate: number) {
    const clampedRate = Math.max(0.2, Math.min(rate, 2.5));
    if (deck === 'A') {
      this.deckARate = clampedRate;
      if (this.deckASource && this.ctx) {
        this.deckASource.playbackRate.setValueAtTime(clampedRate, this.ctx.currentTime);
      }
    } else {
      this.deckBRate = clampedRate;
      if (this.deckBSource && this.ctx) {
        this.deckBSource.playbackRate.setValueAtTime(clampedRate, this.ctx.currentTime);
      }
    }
  }

  // Scratch Emulation
  public triggerScratch(deck: 'A' | 'B', delta: number) {
    this.ensureContext();
    if (!this.ctx) return;

    // Modulate pitch dynamically based on movement velocity
    const speedMultiplier = 1.0 + (delta * 0.08);
    const clampedRate = Math.max(0.1, Math.min(speedMultiplier, 3.0));

    if (deck === 'A' && this.deckASource) {
      this.deckASource.playbackRate.cancelScheduledValues(this.ctx.currentTime);
      this.deckASource.playbackRate.setValueAtTime(clampedRate, this.ctx.currentTime);
      this.deckASource.playbackRate.setTargetAtTime(this.deckARate, this.ctx.currentTime + 0.05, 0.08);
    } else if (deck === 'B' && this.deckBSource) {
      this.deckBSource.playbackRate.cancelScheduledValues(this.ctx.currentTime);
      this.deckBSource.playbackRate.setValueAtTime(clampedRate, this.ctx.currentTime);
      this.deckBSource.playbackRate.setTargetAtTime(this.deckBRate, this.ctx.currentTime + 0.05, 0.08);
    }
  }

  // DJ Mixer Controls: EQ, Filters, Gains
  public setEq(deck: 'A' | 'B', band: 'low' | 'mid' | 'high', gainDb: number, killed: boolean = false) {
    if (!this.ctx) return;
    const filter = deck === 'A' 
      ? (band === 'low' ? this.deckAEqLow : band === 'mid' ? this.deckAEqMid : this.deckAEqHigh)
      : (band === 'low' ? this.deckBEqLow : band === 'mid' ? this.deckBEqMid : this.deckBEqHigh);
    
    if (!filter) return;

    const targetDb = killed ? -60 : Math.max(-26, Math.min(gainDb, 6));
    filter.gain.setTargetAtTime(targetDb, this.ctx.currentTime, 0.02);
  }

  public setFilter(deck: 'A' | 'B', val: number) {
    // val is -1.0 (LPF) to 0.0 (Bypass) to +1.0 (HPF)
    if (!this.ctx) return;
    const filter = deck === 'A' ? this.deckAFilter : this.deckBFilter;
    if (!filter) return;

    if (Math.abs(val) < 0.03) {
      // Neutral bypass
      filter.type = 'allpass';
    } else if (val < 0) {
      // Low Pass Filter (sweep 20000 Hz down to 250 Hz)
      filter.type = 'lowpass';
      const minFreq = 250;
      const maxFreq = 20000;
      // Exponential curve for pleasant sweep
      const norm = 1 + val; // 1 to 0
      const freq = minFreq * Math.pow(maxFreq / minFreq, Math.max(0.01, norm));
      filter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.02);
      filter.Q.setTargetAtTime(2.0, this.ctx.currentTime, 0.02);
    } else {
      // High Pass Filter (sweep 20 Hz up to 6000 Hz)
      filter.type = 'highpass';
      const minFreq = 20;
      const maxFreq = 6000;
      const freq = minFreq * Math.pow(maxFreq / minFreq, val);
      filter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.02);
      filter.Q.setTargetAtTime(2.0, this.ctx.currentTime, 0.02);
    }
  }

  public setGain(deck: 'A' | 'B', value: number) {
    if (!this.ctx) return;
    const gainNode = deck === 'A' ? this.deckAGain : this.deckBGain;
    if (gainNode) {
      gainNode.gain.setTargetAtTime(Math.max(0, Math.min(value, 1.2)), this.ctx.currentTime, 0.02);
    }
  }

  public setTrim(deck: 'A' | 'B', value: number) {
    if (!this.ctx) return;
    const trimNode = deck === 'A' ? this.deckATrim : this.deckBTrim;
    if (trimNode) {
      trimNode.gain.setTargetAtTime(Math.max(0, Math.min(value, 2.0)), this.ctx.currentTime, 0.02);
    }
  }

  public setCrossfader(pos: number, curve: 'smooth' | 'linear' | 'scratch', reverse: boolean, assignA: string, assignB: string) {
    if (!this.ctx || !this.deckACrossGain || !this.deckBCrossGain) return;

    let effectivePos = reverse ? -pos : pos; // -1 (Deck A) to +1 (Deck B)

    let gainA = 1.0;
    let gainB = 1.0;

    if (assignA === 'THRU' && assignB === 'THRU') {
      gainA = 1.0;
      gainB = 1.0;
    } else {
      // Normalize pos to [0, 1] where 0 is full left (Deck A), 1 is full right (Deck B)
      const x = (effectivePos + 1) / 2;

      if (curve === 'smooth') {
        // Equal power crossfade (constant acoustic volume)
        gainA = Math.cos(x * 0.5 * Math.PI);
        gainB = Math.sin(x * 0.5 * Math.PI);
      } else if (curve === 'linear') {
        gainA = Math.max(0, 1 - x);
        gainB = Math.max(0, x);
      } else {
        // Scratch cut curve: instant full volume with sharp cut off at ends
        const cutThreshold = 0.08;
        gainA = x > (1 - cutThreshold) ? 0 : 1;
        gainB = x < cutThreshold ? 0 : 1;
      }

      if (assignA === 'THRU') gainA = 1.0;
      if (assignB === 'THRU') gainB = 1.0;
    }

    this.deckACrossGain.gain.setTargetAtTime(gainA, this.ctx.currentTime, 0.015);
    this.deckBCrossGain.gain.setTargetAtTime(gainB, this.ctx.currentTime, 0.015);
  }

  public setMasterVolume(val: number) {
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(val, 1.2)), this.ctx.currentTime, 0.02);
  }

  // Audio Meters Analysis
  public getMeterLevels() {
    let levelA = 0;
    let levelB = 0;
    let masterL = 0;
    let masterR = 0;

    if (!this.ctx) return { levelA, levelB, masterL, masterR };

    if (this.deckAAnalyser && this.deckAPlaying) {
      const data = new Uint8Array(this.deckAAnalyser.frequencyBinCount);
      this.deckAAnalyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      levelA = Math.min(1.0, Math.sqrt(sum / data.length) * 3.2);
    }

    if (this.deckBAnalyser && this.deckBPlaying) {
      const data = new Uint8Array(this.deckBAnalyser.frequencyBinCount);
      this.deckBAnalyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      levelB = Math.min(1.0, Math.sqrt(sum / data.length) * 3.2);
    }

    if (this.masterAnalyser && (this.deckAPlaying || this.deckBPlaying)) {
      const data = new Uint8Array(this.masterAnalyser.frequencyBinCount);
      this.masterAnalyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.min(1.0, Math.sqrt(sum / data.length) * 2.8);
      masterL = rms;
      masterR = Math.min(1.0, rms * (0.95 + Math.random() * 0.1));
    }

    return { levelA, levelB, masterL, masterR };
  }

  // Sampler Sound Generation
  public playSample(id: number) {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    switch (id) {
      case 1: // Club Airhorn
        this.synthAirhorn(now);
        break;
      case 2: // White Noise Riser
        this.synthRiser(now);
        break;
      case 3: // Laser Synth
        this.synthLaser(now);
        break;
      case 4: // 808 Sub Drop
        this.synthSubDrop(now);
        break;
      case 5: // 909 Open Hat
        this.synthOpenHat(now);
        break;
      case 6: // Punchy Club Clap
        this.synthClap(now);
        break;
      case 7: // Vocal Hype Drop ("Let's Go!")
        this.synthVocalDrop(now);
        break;
      case 8: // Vinyl Scratch Rewind
        this.synthBackspin(now);
        break;
      default:
        break;
    }
  }

  private synthAirhorn(now: number) {
    if (!this.ctx || !this.masterGain) return;
    const freqs = [370, 466, 554]; // High energy brass chord
    [0, 0.12, 0.24].forEach((delay) => {
      freqs.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + delay);
        
        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now + delay);
        osc.stop(now + delay + 0.25);
      });
    });
  }

  private synthRiser(now: number) {
    if (!this.ctx || !this.masterGain) return;
    // Noise buffer
    const bufferSize = this.ctx.sampleRate * 2.0;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(8000, now + 1.8);
    filter.Q.setValueAtTime(5.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 1.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 2.0);
  }

  private synthLaser(now: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  private synthSubDrop(now: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 1.2);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 1.5);
  }

  private synthOpenHat(now: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.36);
  }

  private synthClap(now: number) {
    if (!this.ctx || !this.masterGain) return;
    // 3 micro-bursts followed by sustained reverb tail
    [0, 0.015, 0.03].forEach((delay) => {
      const buffer = this.ctx!.createBuffer(1, this.ctx!.sampleRate * 0.2, this.ctx!.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) output[i] = Math.random() * 2 - 1;
      const noise = this.ctx!.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now + delay);
      filter.Q.setValueAtTime(3.0, now + delay);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0.25, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      noise.start(now + delay);
      noise.stop(now + delay + 0.2);
    });
  }

  private synthVocalDrop(now: number) {
    if (!this.ctx || !this.masterGain) return;
    // Formant vocal chime
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(330, now + 0.15);
    osc.frequency.linearRampToValueAtTime(440, now + 0.4);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, now);
    filter.Q.setValueAtTime(6.0, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.65);
  }

  private synthBackspin(now: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.exponentialRampToValueAtTime(2000, now + 0.4);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  // Live Mix Recording
  public startRecording() {
    this.ensureContext();
    if (!this.recordDest) return false;
    try {
      this.recordedChunks = [];
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';
      
      this.mediaRecorder = new MediaRecorder(this.recordDest.stream, { mimeType });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };
      this.mediaRecorder.start(250);
      this.isRecording = true;
      this.recordStartTime = Date.now();
      return true;
    } catch (err) {
      console.error('Failed to start recording:', err);
      return false;
    }
  }

  public stopRecording(): { blob: Blob; url: string; duration: number } | null {
    if (!this.mediaRecorder || !this.isRecording) return null;
    const duration = (Date.now() - this.recordStartTime) / 1000;
    this.isRecording = false;
    this.mediaRecorder.stop();

    const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder.mimeType });
    const url = URL.createObjectURL(blob);
    return { blob, url, duration };
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}

// Global engine singleton
export const audioEngine = new AudioEngine();
