import { useState, useEffect } from 'react';
import type { 
  Track, 
  DeckState, 
  ChannelMixerState, 
  MixerState, 
  HotCue, 
  LoopState, 
  AppViewMode 
} from './types/dj';
import { audioEngine } from './audio/AudioEngine';
import { createDemoTracks, decodeAudioFile } from './audio/trackGenerator';
import { TopNavBar } from './components/header/TopNavBar';
import { StackedWaveformsContainer } from './components/waveform/StackedWaveformsContainer';
import { DjDeck } from './components/deck/DjDeck';
import { CentralMixer } from './components/mixer/CentralMixer';
import { TrackLibrary } from './components/library/TrackLibrary';
import { SettingsModal } from './components/common/SettingsModal';
import { HelpModal } from './components/common/HelpModal';
import { Disc } from 'lucide-react';

export function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<AppViewMode>('performance');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Deck A Initial State (Cyan theme)
  const [deckA, setDeckA] = useState<DeckState>({
    id: 'A',
    track: null,
    isPlaying: false,
    currentTime: 0,
    cuePosition: 0,
    bpm: 128,
    currentBpm: 128,
    pitchPercent: 0,
    pitchRange: 8,
    isKeyLocked: true,
    isSync: false,
    isMaster: true,
    isSlipMode: false,
    isQuantize: true,
    loop: { active: false, start: 0, end: 0, lengthInBeats: 4 },
    hotCues: [],
    activePadMode: 'hotcue',
    isScratching: false,
    vinylMode: true,
    scratchAngle: 0,
    volumeLevel: 0,
  });

  // Deck B Initial State (Violet/Magenta theme)
  const [deckB, setDeckB] = useState<DeckState>({
    id: 'B',
    track: null,
    isPlaying: false,
    currentTime: 0,
    cuePosition: 0,
    bpm: 124,
    currentBpm: 124,
    pitchPercent: 0,
    pitchRange: 8,
    isKeyLocked: true,
    isSync: false,
    isMaster: false,
    isSlipMode: false,
    isQuantize: true,
    loop: { active: false, start: 0, end: 0, lengthInBeats: 4 },
    hotCues: [],
    activePadMode: 'hotcue',
    isScratching: false,
    vinylMode: true,
    scratchAngle: 0,
    volumeLevel: 0,
  });

  // Mixer Channel States
  const [channelA, setChannelA] = useState<ChannelMixerState>({
    gain: 1.0,
    eqHigh: 0,
    eqMid: 0,
    eqLow: 0,
    killHigh: false,
    killMid: false,
    killLow: false,
    filter: 0,
    faderVolume: 0.85,
    cueHeadphone: false,
    meterLeft: 0,
    meterRight: 0,
  });

  const [channelB, setChannelB] = useState<ChannelMixerState>({
    gain: 1.0,
    eqHigh: 0,
    eqMid: 0,
    eqLow: 0,
    killHigh: false,
    killMid: false,
    killLow: false,
    filter: 0,
    faderVolume: 0.85,
    cueHeadphone: false,
    meterLeft: 0,
    meterRight: 0,
  });

  // Central Mixer Master & Crossfader State
  const [mixer, setMixer] = useState<MixerState>({
    masterVolume: 0.85,
    boothVolume: 0.7,
    headphoneVolume: 0.8,
    headphoneMix: 0.5,
    crossfader: 0.0,
    crossfaderCurve: 'smooth',
    crossfaderReverse: false,
    deckAAssign: 'A',
    deckBAssign: 'B',
    masterMeterL: 0,
    masterMeterR: 0,
  });

  // Initial Load of Demo Tracks
  useEffect(() => {
    let mounted = true;
    async function loadTracks() {
      try {
        const demoTracks = await createDemoTracks();
        if (mounted && demoTracks.length > 0) {
          setTracks(demoTracks);
          // Auto load Track 1 to Deck A and Track 2 to Deck B
          const tA = demoTracks[0];
          const tB = demoTracks[1];

          audioEngine.loadTrack('A', tA);
          setDeckA((prev) => ({
            ...prev,
            track: tA,
            bpm: tA.bpm,
            currentBpm: tA.bpm,
            hotCues: tA.hotCues || [],
          }));

          audioEngine.loadTrack('B', tB);
          setDeckB((prev) => ({
            ...prev,
            track: tB,
            bpm: tB.bpm,
            currentBpm: tB.bpm,
            hotCues: tB.hotCues || [],
          }));
        }
      } catch (err) {
        console.error('Failed to create demo tracks:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadTracks();
    return () => { mounted = false; };
  }, []);

  // Sync Audio Engine controls whenever channel or mixer state changes
  useEffect(() => {
    audioEngine.setTrim('A', channelA.gain);
    audioEngine.setEq('A', 'high', channelA.eqHigh, channelA.killHigh);
    audioEngine.setEq('A', 'mid', channelA.eqMid, channelA.killMid);
    audioEngine.setEq('A', 'low', channelA.eqLow, channelA.killLow);
    audioEngine.setFilter('A', channelA.filter);
    audioEngine.setGain('A', channelA.faderVolume);
  }, [channelA]);

  useEffect(() => {
    audioEngine.setTrim('B', channelB.gain);
    audioEngine.setEq('B', 'high', channelB.eqHigh, channelB.killHigh);
    audioEngine.setEq('B', 'mid', channelB.eqMid, channelB.killMid);
    audioEngine.setEq('B', 'low', channelB.eqLow, channelB.killLow);
    audioEngine.setFilter('B', channelB.filter);
    audioEngine.setGain('B', channelB.faderVolume);
  }, [channelB]);

  useEffect(() => {
    audioEngine.setMasterVolume(mixer.masterVolume);
    audioEngine.setCrossfader(
      mixer.crossfader, 
      mixer.crossfaderCurve, 
      mixer.crossfaderReverse, 
      mixer.deckAAssign, 
      mixer.deckBAssign
    );
  }, [mixer.masterVolume, mixer.crossfader, mixer.crossfaderCurve, mixer.crossfaderReverse, mixer.deckAAssign, mixer.deckBAssign]);

  // High-performance real-time Animation Loop for Playhead Position & VU Meters
  useEffect(() => {
    let animId: number;

    const tick = () => {
      // 1. Update playhead positions from audio engine
      if (deckA.isPlaying) {
        const timeA = audioEngine.getCurrentTime('A');
        // Handle auto-loop boundary
        if (deckA.loop.active && timeA >= deckA.loop.end) {
          audioEngine.seek('A', deckA.loop.start, deckA.loop);
          setDeckA((prev) => ({ ...prev, currentTime: deckA.loop.start }));
        } else {
          setDeckA((prev) => ({ ...prev, currentTime: timeA }));
        }
      }

      if (deckB.isPlaying) {
        const timeB = audioEngine.getCurrentTime('B');
        if (deckB.loop.active && timeB >= deckB.loop.end) {
          audioEngine.seek('B', deckB.loop.start, deckB.loop);
          setDeckB((prev) => ({ ...prev, currentTime: deckB.loop.start }));
        } else {
          setDeckB((prev) => ({ ...prev, currentTime: timeB }));
        }
      }

      // 2. Sample VU meters from Audio Engine
      const meters = audioEngine.getMeterLevels();
      setChannelA((prev) => ({ ...prev, meterLeft: meters.levelA, meterRight: meters.levelA }));
      setChannelB((prev) => ({ ...prev, meterLeft: meters.levelB, meterRight: meters.levelB }));
      setMixer((prev) => ({
        ...prev,
        masterMeterL: meters.masterL,
        masterMeterR: meters.masterR,
      }));

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [deckA.isPlaying, deckA.loop, deckB.isPlaying, deckB.loop]);

  // Deck Controls Handlers
  const handlePlayPause = (deckId: 'A' | 'B') => {
    audioEngine.ensureContext();
    if (deckId === 'A') {
      if (deckA.isPlaying) {
        audioEngine.pause('A');
        setDeckA((prev) => ({ ...prev, isPlaying: false }));
      } else {
        audioEngine.play('A', deckA.currentTime, deckA.loop);
        setDeckA((prev) => ({ ...prev, isPlaying: true }));
      }
    } else {
      if (deckB.isPlaying) {
        audioEngine.pause('B');
        setDeckB((prev) => ({ ...prev, isPlaying: false }));
      } else {
        audioEngine.play('B', deckB.currentTime, deckB.loop);
        setDeckB((prev) => ({ ...prev, isPlaying: true }));
      }
    }
  };

  const handleCue = (deckId: 'A' | 'B') => {
    audioEngine.ensureContext();
    if (deckId === 'A') {
      if (deckA.isPlaying) {
        audioEngine.pause('A');
        audioEngine.seek('A', deckA.cuePosition, deckA.loop);
        setDeckA((prev) => ({ ...prev, isPlaying: false, currentTime: prev.cuePosition }));
      } else {
        // Set new cue point to current time if paused
        setDeckA((prev) => ({ ...prev, cuePosition: prev.currentTime }));
      }
    } else {
      if (deckB.isPlaying) {
        audioEngine.pause('B');
        audioEngine.seek('B', deckB.cuePosition, deckB.loop);
        setDeckB((prev) => ({ ...prev, isPlaying: false, currentTime: prev.cuePosition }));
      } else {
        setDeckB((prev) => ({ ...prev, cuePosition: prev.currentTime }));
      }
    }
  };

  const handleSeek = (deckId: 'A' | 'B', time: number) => {
    audioEngine.ensureContext();
    const loop = deckId === 'A' ? deckA.loop : deckB.loop;
    audioEngine.seek(deckId, time, loop);
    if (deckId === 'A') {
      setDeckA((prev) => ({ ...prev, currentTime: time }));
    } else {
      setDeckB((prev) => ({ ...prev, currentTime: time }));
    }
  };

  const handleScratch = (deckId: 'A' | 'B', delta: number) => {
    audioEngine.triggerScratch(deckId, delta);
  };

  const handleNudge = (deckId: 'A' | 'B', amount: number) => {
    audioEngine.ensureContext();
    const deck = deckId === 'A' ? deckA : deckB;
    const currentRate = 1.0 + (deck.pitchPercent / 100);
    const nudgedRate = currentRate + amount;
    audioEngine.setPlaybackRate(deckId, nudgedRate);

    // Return to pitch fader rate after 120ms
    setTimeout(() => {
      audioEngine.setPlaybackRate(deckId, currentRate);
    }, 120);
  };

  const handlePitchChange = (deckId: 'A' | 'B', percent: number) => {
    const rate = 1.0 + (percent / 100);
    audioEngine.setPlaybackRate(deckId, rate);

    if (deckId === 'A') {
      const newBpm = deckA.bpm * rate;
      setDeckA((prev) => ({
        ...prev,
        pitchPercent: percent,
        currentBpm: newBpm,
      }));
    } else {
      const newBpm = deckB.bpm * rate;
      setDeckB((prev) => ({
        ...prev,
        pitchPercent: percent,
        currentBpm: newBpm,
      }));
    }
  };

  const handleSync = (deckId: 'A' | 'B') => {
    const sourceDeck = deckId === 'A' ? deckB : deckA;
    if (!sourceDeck.track) return;

    const targetBpm = sourceDeck.currentBpm;
    const targetDeck = deckId === 'A' ? deckA : deckB;
    const neededPitch = ((targetBpm / targetDeck.bpm) - 1) * 100;

    handlePitchChange(deckId, neededPitch);

    if (deckId === 'A') {
      setDeckA((prev) => ({ ...prev, isSync: true }));
    } else {
      setDeckB((prev) => ({ ...prev, isSync: true }));
    }
  };

  // Auto Loop Handlers
  const handleSetAutoLoop = (deckId: 'A' | 'B', beats: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const beatSec = 60 / deck.currentBpm;
    const loopLenSec = beats * beatSec;
    const start = deck.currentTime;
    const end = start + loopLenSec;

    const newLoop: LoopState = {
      active: true,
      start,
      end,
      lengthInBeats: beats,
    };

    if (deckId === 'A') {
      setDeckA((prev) => ({ ...prev, loop: newLoop }));
      if (deck.isPlaying) audioEngine.play('A', start, newLoop);
    } else {
      setDeckB((prev) => ({ ...prev, loop: newLoop }));
      if (deck.isPlaying) audioEngine.play('B', start, newLoop);
    }
  };

  const handleToggleLoop = (deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    const newActive = !deck.loop.active;

    if (deckId === 'A') {
      setDeckA((prev) => ({ ...prev, loop: { ...prev.loop, active: newActive } }));
      if (deck.isPlaying) audioEngine.play('A', deck.currentTime, { ...deck.loop, active: newActive });
    } else {
      setDeckB((prev) => ({ ...prev, loop: { ...prev.loop, active: newActive } }));
      if (deck.isPlaying) audioEngine.play('B', deck.currentTime, { ...deck.loop, active: newActive });
    }
  };

  const handleHalveLoop = (deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    if (!deck.loop.active) return;
    const newLen = Math.max(0.25, deck.loop.lengthInBeats / 2);
    handleSetAutoLoop(deckId, newLen);
  };

  const handleDoubleLoop = (deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    if (!deck.loop.active) return;
    const newLen = Math.min(64, deck.loop.lengthInBeats * 2);
    handleSetAutoLoop(deckId, newLen);
  };

  // Hot Cues Handlers
  const handleJumpToCue = (deckId: 'A' | 'B', cue: HotCue) => {
    handleSeek(deckId, cue.position);
  };

  const handleSetCue = (deckId: 'A' | 'B', id: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const colors = ['#00E5FF', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#06B6D4'];
    const newCue: HotCue = {
      id,
      position: Number(deck.currentTime.toFixed(2)),
      label: `Cue ${id}`,
      color: colors[(id - 1) % colors.length],
    };

    if (deckId === 'A') {
      setDeckA((prev) => ({ ...prev, hotCues: [...prev.hotCues.filter(c => c.id !== id), newCue] }));
    } else {
      setDeckB((prev) => ({ ...prev, hotCues: [...prev.hotCues.filter(c => c.id !== id), newCue] }));
    }
  };

  const handleDeleteCue = (deckId: 'A' | 'B', id: number) => {
    if (deckId === 'A') {
      setDeckA((prev) => ({ ...prev, hotCues: prev.hotCues.filter(c => c.id !== id) }));
    } else {
      setDeckB((prev) => ({ ...prev, hotCues: prev.hotCues.filter(c => c.id !== id) }));
    }
  };

  const handleBeatJump = (deckId: 'A' | 'B', beats: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const beatSec = 60 / deck.currentBpm;
    const target = deck.currentTime + (beats * beatSec);
    handleSeek(deckId, target);
  };

  const handleTriggerSample = (sampleId: number) => {
    audioEngine.playSample(sampleId);
  };

  const handlePadFx = (deckId: 'A' | 'B', fxType: string) => {
    audioEngine.ensureContext();
    if (fxType === 'brake') {
      handleNudge(deckId, -0.6);
    } else if (fxType.startsWith('roll')) {
      const beats = fxType === 'roll-1-16' ? 0.0625 : fxType === 'roll-1-8' ? 0.125 : fxType === 'roll-1-4' ? 0.25 : 0.5;
      handleSetAutoLoop(deckId, beats);
    }
  };

  // Track Loading from Library
  const handleLoadTrackA = (track: Track) => {
    audioEngine.loadTrack('A', track);
    setDeckA((prev) => ({
      ...prev,
      track,
      bpm: track.bpm,
      currentBpm: track.bpm * (1 + prev.pitchPercent / 100),
      currentTime: 0,
      cuePosition: 0,
      hotCues: track.hotCues || [],
    }));
  };

  const handleLoadTrackB = (track: Track) => {
    audioEngine.loadTrack('B', track);
    setDeckB((prev) => ({
      ...prev,
      track,
      bpm: track.bpm,
      currentBpm: track.bpm * (1 + prev.pitchPercent / 100),
      currentTime: 0,
      cuePosition: 0,
      hotCues: track.hotCues || [],
    }));
  };

  // Local File Import
  const handleImportFile = async (file: File) => {
    try {
      const newTrack = await decodeAudioFile(file);
      setTracks((prev) => [newTrack, ...prev]);
    } catch (err) {
      console.error('Error importing audio file:', err);
      alert('Could not decode audio file. Please ensure it is a valid MP3, WAV, or AAC file.');
    }
  };

  // Live Mix Recording Toggle & Download
  const handleToggleRecording = () => {
    if (isRecording) {
      const result = audioEngine.stopRecording();
      setIsRecording(false);
      if (result) {
        // Trigger mix audio download
        const a = document.createElement('a');
        a.href = result.url;
        a.download = `NIGHTSHIFT-Club-Mix-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } else {
      const started = audioEngine.startRecording();
      if (started) {
        setIsRecording(true);
      }
    }
  };

  // Global Keyboard Shortcuts (Spacebar, C, Enter, K, S, B, Z, M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a search input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause('A');
      } else if (e.code === 'Enter') {
        e.preventDefault();
        handlePlayPause('B');
      } else if (e.code === 'KeyC') {
        handleCue('A');
      } else if (e.code === 'KeyK') {
        handleCue('B');
      } else if (e.code === 'KeyS') {
        handleSync('A');
      } else if (e.code === 'KeyB') {
        handleSync('B');
      } else if (e.code === 'KeyZ') {
        // Toggle Deck A Bass Kill
        setChannelA((prev) => ({ ...prev, killLow: !prev.killLow }));
      } else if (e.code === 'KeyM') {
        // Toggle Deck B Bass Kill
        setChannelB((prev) => ({ ...prev, killLow: !prev.killLow }));
      } else if (e.code === 'BracketLeft') {
        handleNudge('A', -0.03);
      } else if (e.code === 'BracketRight') {
        handleNudge('A', 0.03);
      } else if (e.code === 'Minus') {
        handleNudge('B', -0.03);
      } else if (e.code === 'Equal') {
        handleNudge('B', 0.03);
      } else if (e.code === 'ArrowLeft') {
        setMixer((prev) => ({ ...prev, crossfader: Math.max(-1.0, prev.crossfader - 0.1) }));
      } else if (e.code === 'ArrowRight') {
        setMixer((prev) => ({ ...prev, crossfader: Math.min(1.0, prev.crossfader + 0.1) }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deckA, deckB]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#090B10] text-slate-100 font-mono select-none">
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-glow-cyan mb-4 animate-pulse">
          <Disc size={32} className="text-black animate-spin-slow" />
        </div>
        <h1 className="text-lg font-black tracking-widest text-white mb-1">
          NIGHT<span className="text-cyan-400">SHIFT</span>
        </h1>
        <p className="text-xs text-slate-400">INITIALIZING AUDIO ENGINE & WAVEFORMS...</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-[#090B10] text-slate-100 overflow-hidden font-sans select-none">
      {/* 1. Pro Top Navigation Bar */}
      <TopNavBar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isRecording={isRecording}
        onToggleRecording={handleToggleRecording}
        masterVolume={mixer.masterVolume}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* 2. Main High-Density DJ Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden p-2 gap-2">
        {/* Stacked Scrolling Audio Waveforms with Beat Phase Meter (Serato / Rekordbox Style) */}
        {viewMode !== 'library' && (
          <StackedWaveformsContainer
            deckA={deckA}
            deckB={deckB}
            onSeekDeckA={(t) => handleSeek('A', t)}
            onSeekDeckB={(t) => handleSeek('B', t)}
            onScratchDeckA={(delta) => handleScratch('A', delta)}
            onScratchDeckB={(delta) => handleScratch('B', delta)}
          />
        )}

        {/* Dual DJ Decks + Central Hardware Mixer */}
        {viewMode !== 'library' && (
          <div className="flex flex-1 gap-2 min-h-0">
            {/* Deck A — Electric Cyan Theme */}
            <DjDeck
              deck={deckA}
              colorScheme="cyan"
              onPlayPause={() => handlePlayPause('A')}
              onCue={() => handleCue('A')}
              onSync={() => handleSync('A')}
              onToggleMaster={() => setDeckA((prev) => ({ ...prev, isMaster: !prev.isMaster }))}
              onSeek={(t) => handleSeek('A', t)}
              onScratch={(delta) => handleScratch('A', delta)}
              onNudge={(amt) => handleNudge('A', amt)}
              onPitchChange={(p) => handlePitchChange('A', p)}
              onRangeChange={(r) => setDeckA((prev) => ({ ...prev, pitchRange: r }))}
              onResetPitch={() => handlePitchChange('A', 0)}
              onToggleKeyLock={() => setDeckA((prev) => ({ ...prev, isKeyLocked: !prev.isKeyLocked }))}
              onToggleSlip={() => setDeckA((prev) => ({ ...prev, isSlipMode: !prev.isSlipMode }))}
              onToggleQuantize={() => setDeckA((prev) => ({ ...prev, isQuantize: !prev.isQuantize }))}
              onSetAutoLoop={(b) => handleSetAutoLoop('A', b)}
              onToggleLoop={() => handleToggleLoop('A')}
              onHalveLoop={() => handleHalveLoop('A')}
              onDoubleLoop={() => handleDoubleLoop('A')}
              onSetLoopIn={() => handleSeek('A', deckA.currentTime)}
              onSetLoopOut={() => handleSetAutoLoop('A', 4)}
              onJumpToCue={(c) => handleJumpToCue('A', c)}
              onSetCue={(id) => handleSetCue('A', id)}
              onDeleteCue={(id) => handleDeleteCue('A', id)}
              onBeatJump={(b) => handleBeatJump('A', b)}
              onTriggerSample={handleTriggerSample}
              onPadFx={(fx) => handlePadFx('A', fx)}
            />

            {/* Central Professional DJ Mixer */}
            <CentralMixer
              channelA={channelA}
              channelB={channelB}
              mixer={mixer}
              onUpdateChannelA={(patch) => setChannelA((prev) => ({ ...prev, ...patch }))}
              onUpdateChannelB={(patch) => setChannelB((prev) => ({ ...prev, ...patch }))}
              onUpdateMixer={(patch) => setMixer((prev) => ({ ...prev, ...patch }))}
            />

            {/* Deck B — Vivid Violet / Magenta Theme */}
            <DjDeck
              deck={deckB}
              colorScheme="violet"
              onPlayPause={() => handlePlayPause('B')}
              onCue={() => handleCue('B')}
              onSync={() => handleSync('B')}
              onToggleMaster={() => setDeckB((prev) => ({ ...prev, isMaster: !prev.isMaster }))}
              onSeek={(t) => handleSeek('B', t)}
              onScratch={(delta) => handleScratch('B', delta)}
              onNudge={(amt) => handleNudge('B', amt)}
              onPitchChange={(p) => handlePitchChange('B', p)}
              onRangeChange={(r) => setDeckB((prev) => ({ ...prev, pitchRange: r }))}
              onResetPitch={() => handlePitchChange('B', 0)}
              onToggleKeyLock={() => setDeckB((prev) => ({ ...prev, isKeyLocked: !prev.isKeyLocked }))}
              onToggleSlip={() => setDeckB((prev) => ({ ...prev, isSlipMode: !prev.isSlipMode }))}
              onToggleQuantize={() => setDeckB((prev) => ({ ...prev, isQuantize: !prev.isQuantize }))}
              onSetAutoLoop={(b) => handleSetAutoLoop('B', b)}
              onToggleLoop={() => handleToggleLoop('B')}
              onHalveLoop={() => handleHalveLoop('B')}
              onDoubleLoop={() => handleDoubleLoop('B')}
              onSetLoopIn={() => handleSeek('B', deckB.currentTime)}
              onSetLoopOut={() => handleSetAutoLoop('B', 4)}
              onJumpToCue={(c) => handleJumpToCue('B', c)}
              onSetCue={(id) => handleSetCue('B', id)}
              onDeleteCue={(id) => handleDeleteCue('B', id)}
              onBeatJump={(b) => handleBeatJump('B', b)}
              onTriggerSample={handleTriggerSample}
              onPadFx={(fx) => handlePadFx('B', fx)}
            />
          </div>
        )}

        {/* 3. Bottom Track Library / Crate Browser */}
        <div className={viewMode === 'library' ? 'flex-1 flex overflow-hidden' : 'h-[235px] flex overflow-hidden'}>
          <TrackLibrary
            tracks={tracks}
            deckATrackId={deckA.track?.id || null}
            deckBTrackId={deckB.track?.id || null}
            onLoadTrackA={handleLoadTrackA}
            onLoadTrackB={handleLoadTrackB}
            onImportFile={handleImportFile}
            activeCamelotKey={deckA.isPlaying ? deckA.track?.key : deckB.isPlaying ? deckB.track?.key : undefined}
          />
        </div>
      </div>

      {/* Preferences & Help Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default App;
