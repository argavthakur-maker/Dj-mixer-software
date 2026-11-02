import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  Track,
  DeckState,
  ChannelMixerState,
  MixerState,
  HotCue,
  LoopState,
  AppViewMode,
} from './types/dj';
import { audioEngine } from './audio/AudioEngine';
import { createDemoTracks, decodeAudioFile } from './audio/trackGenerator';
import { TopNavBar } from './components/header/TopNavBar';
import { DjDeck } from './components/deck/DjDeck';
import { CentralMixer } from './components/mixer/CentralMixer';
import { StackedWaveformsContainer } from './components/waveform/StackedWaveformsContainer';
import { TrackLibrary } from './components/library/TrackLibrary';
import { SettingsModal } from './components/common/SettingsModal';
import { HelpModal } from './components/common/HelpModal';

function createInitialDeck(id: 'A' | 'B', bpm: number): DeckState {
  return {
    id,
    track: null,
    isPlaying: false,
    currentTime: 0,
    cuePosition: 0,
    bpm,
    currentBpm: bpm,
    pitchPercent: 0,
    pitchRange: 8,
    isKeyLocked: true,
    isSync: false,
    isMaster: id === 'A',
    isSlipMode: false,
    isQuantize: true,
    loop: { active: false, start: 0, end: 0, lengthInBeats: 4 },
    hotCues: [],
    activePadMode: 'hotcue',
    isScratching: false,
    vinylMode: true,
    scratchAngle: 0,
    volumeLevel: 0,
  };
}

function createInitialChannel(): ChannelMixerState {
  return {
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
  };
}

export function App() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<AppViewMode>('performance');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);

  const [deckA, setDeckA] = useState<DeckState>(() => createInitialDeck('A', 128));
  const [deckB, setDeckB] = useState<DeckState>(() => createInitialDeck('B', 124));

  const [channelA, setChannelA] = useState<ChannelMixerState>(createInitialChannel);
  const [channelB, setChannelB] = useState<ChannelMixerState>(createInitialChannel);

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

  // Mutable refs for the animation loop (avoids re-subscribing rAF every render)
  const deckStateRef = useRef({ deckA, deckB });
  deckStateRef.current = { deckA, deckB };

  // Initial Load of Demo Tracks
  useEffect(() => {
    let mounted = true;
    async function loadTracks() {
      try {
        const demoTracks = await createDemoTracks();
        if (mounted && demoTracks.length > 0) {
          setTracks(demoTracks);
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

  const applyChannel = useCallback((deckId: 'A' | 'B', ch: ChannelMixerState) => {
    audioEngine.setTrim(deckId, ch.gain);
    audioEngine.setEq(deckId, 'high', ch.eqHigh, ch.killHigh);
    audioEngine.setEq(deckId, 'mid', ch.eqMid, ch.killMid);
    audioEngine.setEq(deckId, 'low', ch.eqLow, ch.killLow);
    audioEngine.setFilter(deckId, ch.filter);
    audioEngine.setGain(deckId, ch.faderVolume);
  }, []);

  useEffect(() => { applyChannel('A', channelA); }, [channelA, applyChannel]);
  useEffect(() => { applyChannel('B', channelB); }, [channelB, applyChannel]);

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

  // High-performance animation loop for playhead positions & VU meters
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const { deckA: dA, deckB: dB } = deckStateRef.current;

      if (dA.isPlaying) {
        const timeA = audioEngine.getCurrentTime('A');
        const handled = dA.loop.active && timeA >= dA.loop.end && dA.loop.end > dA.loop.start;
        const safeTime = handled ? dA.loop.start : timeA;
        if (handled) audioEngine.seek('A', dA.loop.start, dA.loop);
        setDeckA((prev) => (prev.currentTime !== safeTime ? { ...prev, currentTime: safeTime } : prev));
      }

      if (dB.isPlaying) {
        const timeB = audioEngine.getCurrentTime('B');
        const handled = dB.loop.active && timeB >= dB.loop.end && dB.loop.end > dB.loop.start;
        const safeTime = handled ? dB.loop.start : timeB;
        if (handled) audioEngine.seek('B', dB.loop.start, dB.loop);
        setDeckB((prev) => (prev.currentTime !== safeTime ? { ...prev, currentTime: safeTime } : prev));
      }

      // Sample VU meters from Audio Engine
      const meters = audioEngine.getMeterLevels();
      if (channelA.meterLeft !== meters.levelA) {
        setChannelA((prev) => ({ ...prev, meterLeft: meters.levelA, meterRight: meters.levelA }));
      }
      if (channelB.meterLeft !== meters.levelB) {
        setChannelB((prev) => ({ ...prev, meterLeft: meters.levelB, meterRight: meters.levelB }));
      }
      setMixer((prev) => {
        if (prev.masterMeterL === meters.masterL && prev.masterMeterR === meters.masterR) return prev;
        return { ...prev, masterMeterL: meters.masterL, masterMeterR: meters.masterR };
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [channelA.meterLeft, channelB.meterLeft]);

  // Track Loading from Library
  const loadTrackToDeck = useCallback((deckId: 'A' | 'B', track: Track) => {
    audioEngine.loadTrack(deckId, track);
    const setter = deckId === 'A' ? setDeckA : setDeckB;
    setter((prev) => ({
      ...prev,
      track,
      bpm: track.bpm,
      currentBpm: track.bpm * (1 + prev.pitchPercent / 100),
      currentTime: 0,
      cuePosition: 0,
      isSync: false,
      hotCues: track.hotCues ? [...track.hotCues] : [],
      loop: { active: false, start: 0, end: 0, lengthInBeats: 4 },
    }));
  }, []);

  // Deck Controls Handlers
  const handlePlayPause = useCallback((deckId: 'A' | 'B') => {
    audioEngine.ensureContext();
    const deck = deckId === 'A' ? deckA : deckB;
    if (deck.isPlaying) {
      audioEngine.pause(deckId);
      (deckId === 'A' ? setDeckA : setDeckB)((prev) => ({ ...prev, isPlaying: false }));
    } else {
      audioEngine.play(deckId, deck.currentTime, deck.loop);
      (deckId === 'A' ? setDeckA : setDeckB)((prev) => ({ ...prev, isPlaying: true }));
    }
  }, [deckA, deckB]);

  const handleCue = useCallback((deckId: 'A' | 'B') => {
    audioEngine.ensureContext();
    const deck = deckId === 'A' ? deckA : deckB;
    if (deck.isPlaying) {
      audioEngine.pause(deckId);
      audioEngine.seek(deckId, deck.cuePosition, deck.loop);
      (deckId === 'A' ? setDeckA : setDeckB)((prev) => ({ ...prev, isPlaying: false, currentTime: prev.cuePosition }));
    } else {
      (deckId === 'A' ? setDeckA : setDeckB)((prev) => ({ ...prev, cuePosition: prev.currentTime }));
    }
  }, [deckA, deckB]);

  const handleSeek = useCallback((deckId: 'A' | 'B', time: number) => {
    audioEngine.ensureContext();
    const loop = deckId === 'A' ? deckA.loop : deckB.loop;
    audioEngine.seek(deckId, time, loop);
    (deckId === 'A' ? setDeckA : setDeckB)((prev) => ({ ...prev, currentTime: time }));
  }, [deckA.loop, deckB.loop]);

  const handleScratch = useCallback((deckId: 'A' | 'B', delta: number) => {
    audioEngine.triggerScratch(deckId, delta);
  }, []);

  const handleNudge = useCallback((deckId: 'A' | 'B', amount: number) => {
    audioEngine.ensureContext();
    const deck = deckId === 'A' ? deckA : deckB;
    const currentRate = 1.0 + (deck.pitchPercent / 100);
    audioEngine.setPlaybackRate(deckId, currentRate + amount);
    setTimeout(() => {
      audioEngine.setPlaybackRate(deckId, currentRate);
    }, 120);
  }, [deckA.pitchPercent, deckB.pitchPercent]);

  const handlePitchChange = useCallback((deckId: 'A' | 'B', percent: number) => {
    audioEngine.ensureContext();
    const rate = 1.0 + (percent / 100);
    audioEngine.setPlaybackRate(deckId, rate);
    (deckId === 'A' ? setDeckA : setDeckB)((prev) => ({
      ...prev,
      pitchPercent: percent,
      currentBpm: prev.bpm * rate,
    }));
  }, []);

  const handleSync = useCallback((deckId: 'A' | 'B') => {
    const sourceDeck = deckId === 'A' ? deckB : deckA;
    if (!sourceDeck.track) return;
    const targetDeck = deckId === 'A' ? deckA : deckB;
    const neededPitch = ((sourceDeck.currentBpm / targetDeck.bpm) - 1) * 100;
    handlePitchChange(deckId, neededPitch);
    (deckId === 'A' ? setDeckA : setDeckB)((prev) => ({ ...prev, isSync: true }));
  }, [deckA, deckB, handlePitchChange]);

  // Auto Loop Handlers
  const handleSetAutoLoop = useCallback((deckId: 'A' | 'B', beats: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    if (!deck.track) return;
    const beatSec = 60 / deck.currentBpm;
    const loopLenSec = beats * beatSec;
    const start = deck.currentTime;
    // Clamp loop inside the track
    const end = Math.min(start + loopLenSec, deck.track.duration);

    const newLoop: LoopState = {
      active: true,
      start,
      end,
      lengthInBeats: beats,
    };

    (deckId === 'A' ? setDeckA : setDeckB)((prev) => ({ ...prev, loop: newLoop }));
    if (deck.isPlaying) audioEngine.play(deckId, start, newLoop);
  }, [deckA, deckB]);

  const handleToggleLoop = useCallback((deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    const newActive = !deck.loop.active;
    (deckId === 'A' ? setDeckA : setDeckB)((prev) => ({
      ...prev,
      loop: { ...prev.loop, active: newActive },
    }));
    if (deck.isPlaying) {
      audioEngine.play(deckId, deck.currentTime, { ...deck.loop, active: newActive });
    }
  }, [deckA, deckB]);

  const handleHalveLoop = useCallback((deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    if (!deck.loop.active) return;
    handleSetAutoLoop(deckId, Math.max(0.25, deck.loop.lengthInBeats / 2));
  }, [deckA, deckB, handleSetAutoLoop]);

  const handleDoubleLoop = useCallback((deckId: 'A' | 'B') => {
    const deck = deckId === 'A' ? deckA : deckB;
    if (!deck.loop.active) return;
    handleSetAutoLoop(deckId, Math.min(64, deck.loop.lengthInBeats * 2));
  }, [deckA, deckB, handleSetAutoLoop]);

  // Hot Cues Handlers
  const handleJumpToCue = useCallback((deckId: 'A' | 'B', cue: HotCue) => {
    handleSeek(deckId, cue.position);
  }, [handleSeek]);

  const handleSetCue = useCallback((deckId: 'A' | 'B', id: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const colors = ['#00E5FF', '#8B5CF6', '#D946EF', '#FFBF47', '#37F59A', '#38F6FF', '#FF3B57', '#A7B1C2'];
    const newCue: HotCue = {
      id,
      position: Number(deck.currentTime.toFixed(2)),
      label: `Cue ${id}`,
      color: colors[(id - 1) % colors.length],
    };
    (deckId === 'A' ? setDeckA : setDeckB)((prev) => ({
      ...prev,
      hotCues: [...prev.hotCues.filter((c) => c.id !== id), newCue],
    }));
  }, [deckA.currentTime, deckB.currentTime]);

  const handleDeleteCue = useCallback((deckId: 'A' | 'B', id: number) => {
    (deckId === 'A' ? setDeckA : setDeckB)((prev) => ({
      ...prev,
      hotCues: prev.hotCues.filter((c) => c.id !== id),
    }));
  }, []);

  const handleBeatJump = useCallback((deckId: 'A' | 'B', beats: number) => {
    const deck = deckId === 'A' ? deckA : deckB;
    const beatSec = 60 / deck.currentBpm;
    handleSeek(deckId, deck.currentTime + beats * beatSec);
  }, [deckA, deckB, handleSeek]);

  const handleTriggerSample = useCallback((sampleId: number) => {
    audioEngine.playSample(sampleId);
  }, []);

  const handlePadFx = useCallback((deckId: 'A' | 'B', fxType: string) => {
    audioEngine.ensureContext();
    if (fxType === 'brake') {
      handleNudge(deckId, -0.6);
    } else if (fxType.startsWith('roll')) {
      const beats = fxType === 'roll-1-16' ? 0.0625 : fxType === 'roll-1-8' ? 0.125 : fxType === 'roll-1-4' ? 0.25 : 0.5;
      handleSetAutoLoop(deckId, beats);
    }
  }, [handleNudge, handleSetAutoLoop]);

  // Local File Import
  const handleImportFile = useCallback(async (file: File) => {
    try {
      const newTrack = await decodeAudioFile(file);
      setTracks((prev) => [newTrack, ...prev]);
    } catch (err) {
      console.error('Error importing audio file:', err);
      alert('Could not decode audio file. Please ensure it is a valid MP3, WAV, or AAC file that your browser can play.');
    }
  }, []);

  // Live Mix Recording Toggle & Download
  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      const result = audioEngine.stopRecording();
      setIsRecording(false);
      if (result) {
        const a = document.createElement('a');
        a.href = result.url;
        a.download = `NIGHTSHIFT-Mix-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } else {
      const started = audioEngine.startRecording();
      if (started) setIsRecording(true);
    }
  }, [isRecording]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.repeat) return;

      switch (e.code) {
        case 'Space': e.preventDefault(); handlePlayPause('A'); break;
        case 'Enter': e.preventDefault(); handlePlayPause('B'); break;
        case 'KeyC': handleCue('A'); break;
        case 'KeyK': handleCue('B'); break;
        case 'KeyS': handleSync('A'); break;
        case 'KeyB': handleSync('B'); break;
        case 'KeyZ': setChannelA((prev) => ({ ...prev, killLow: !prev.killLow })); break;
        case 'KeyM': setChannelB((prev) => ({ ...prev, killLow: !prev.killLow })); break;
        case 'BracketLeft': handleNudge('A', -0.03); break;
        case 'BracketRight': handleNudge('A', 0.03); break;
        case 'Minus': handleNudge('B', -0.03); break;
        case 'Equal': handleNudge('B', 0.03); break;
        case 'ArrowLeft': setMixer((prev) => ({ ...prev, crossfader: Math.max(-1, prev.crossfader - 0.1) })); break;
        case 'ArrowRight': setMixer((prev) => ({ ...prev, crossfader: Math.min(1, prev.crossfader + 0.1) })); break;
        case 'KeyL': setLibraryCollapsed((prev) => !prev); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleCue, handleSync, handleNudge]);

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#07090D] relative overflow-hidden">
        <div className="absolute inset-0 stage-glow-a" />
        <div className="absolute inset-0 stage-glow-b" />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#8B5CF6] flex items-center justify-center shadow-glow-cyan mb-4 animate-pulse">
          <div className="w-11 h-11 rounded-full bg-[#07090D] border border-[#252D3A] flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#8B5CF6]" />
          </div>
        </div>
        <h1 className="font-sans font-bold text-xl tracking-[0.18em] text-[#F4F7FC]">
          NIGHT<span className="text-[#00E5FF]">SHIFT</span>
        </h1>
        <p className="mt-1 text-[10px] font-mono tracking-[0.25em] text-[#8490A3]">INITIALIZING AUDIO ENGINE & WAVEFORMS</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-[#07090D] overflow-hidden flex flex-col">
      {/* Ambient stage lighting */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 stage-glow-a" />
        <div className="absolute inset-0 stage-glow-b" />
        <div className="absolute inset-0 stage-vignette" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <TopNavBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isRecording={isRecording}
          onToggleRecording={handleToggleRecording}
          deckA={deckA}
          deckB={deckB}
          masterMeterL={mixer.masterMeterL}
          masterMeterR={mixer.masterMeterR}
          libraryCollapsed={libraryCollapsed}
          onToggleLibrary={() => setLibraryCollapsed((prev) => !prev)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
        />

        {viewMode === 'library' ? (
          <div className="flex-1 overflow-hidden p-1">
            <div className="h-full flex flex-col border border-[#252D3A] rounded-md overflow-hidden bg-[#0D1118]">
              <TrackLibrary
                tracks={tracks}
                deckATrackId={deckA.track?.id ?? null}
                deckBTrackId={deckB.track?.id ?? null}
                onLoadTrackA={(t) => loadTrackToDeck('A', t)}
                onLoadTrackB={(t) => loadTrackToDeck('B', t)}
                onImportFile={handleImportFile}
                activeCamelotKey={deckA.isPlaying ? deckA.track?.key : deckB.isPlaying ? deckB.track?.key : undefined}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Performance workspace: decks | waveforms + mixer | decks */}
            <div className="flex-1 min-h-0 flex gap-1.5 p-1.5">
              {/* Deck A — Electric Cyan */}
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
                onJumpToCue={(c) => handleJumpToCue('A', c)}
                onSetCue={(id) => handleSetCue('A', id)}
                onDeleteCue={(id) => handleDeleteCue('A', id)}
                onBeatJump={(b) => handleBeatJump('A', b)}
                onTriggerSample={handleTriggerSample}
                onPadFx={(fx) => handlePadFx('A', fx)}
              />

              {/* Central column: synchronized waveforms over the mixer */}
              <div className="w-[350px] xl:w-[390px] shrink-0 flex flex-col gap-1.5 min-h-0">
                <div className="flex-1 min-h-0">
                  <StackedWaveformsContainer
                    deckA={deckA}
                    deckB={deckB}
                    onSeekDeckA={(t) => handleSeek('A', t)}
                    onSeekDeckB={(t) => handleSeek('B', t)}
                    onScratchDeckA={(d) => handleScratch('A', d)}
                    onScratchDeckB={(d) => handleScratch('B', d)}
                  />
                </div>
                <CentralMixer
                  channelA={channelA}
                  channelB={channelB}
                  mixer={mixer}
                  onUpdateChannelA={(patch) => setChannelA((prev) => ({ ...prev, ...patch }))}
                  onUpdateChannelB={(patch) => setChannelB((prev) => ({ ...prev, ...patch }))}
                  onUpdateMixer={(patch) => setMixer((prev) => ({ ...prev, ...patch }))}
                />
              </div>

              {/* Deck B — Violet / Magenta */}
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
                onJumpToCue={(c) => handleJumpToCue('B', c)}
                onSetCue={(id) => handleSetCue('B', id)}
                onDeleteCue={(id) => handleDeleteCue('B', id)}
                onBeatJump={(b) => handleBeatJump('B', b)}
                onTriggerSample={handleTriggerSample}
                onPadFx={(fx) => handlePadFx('B', fx)}
              />
            </div>

            {/* Collapsible Music Library */}
            <div
              className={`shrink-0 border-t border-[#252D3A] transition-[height] duration-200 ease-out overflow-hidden ${
                libraryCollapsed ? 'h-8' : 'h-[240px] 2xl:h-[280px]'
              }`}
            >
              <TrackLibrary
                tracks={tracks}
                collapsedRow={libraryCollapsed}
                onToggleCollapsed={() => setLibraryCollapsed((prev) => !prev)}
                deckATrackId={deckA.track?.id ?? null}
                deckBTrackId={deckB.track?.id ?? null}
                onLoadTrackA={(t) => loadTrackToDeck('A', t)}
                onLoadTrackB={(t) => loadTrackToDeck('B', t)}
                onImportFile={handleImportFile}
                activeCamelotKey={deckA.isPlaying ? deckA.track?.key : deckB.isPlaying ? deckB.track?.key : undefined}
              />
            </div>
          </>
        )}
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default App;
