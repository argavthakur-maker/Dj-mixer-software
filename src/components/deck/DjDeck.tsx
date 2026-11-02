import React from 'react';
import type { DeckState, HotCue } from '../../types/dj';
import { DeckHeader } from './DeckHeader';
import { OverviewWaveform } from '../waveform/OverviewWaveform';
import { JogWheel } from './JogWheel';
import { PitchFader } from './PitchFader';
import { LoopSection } from './LoopSection';
import { PerformancePads } from './PerformancePads';
import { DeckControls } from './DeckControls';
import { History, Zap } from 'lucide-react';

interface DjDeckProps {
  deck: DeckState;
  colorScheme: 'cyan' | 'violet';
  onPlayPause: () => void;
  onCue: () => void;
  onSync: () => void;
  onToggleMaster: () => void;
  onSeek: (time: number) => void;
  onScratch: (delta: number) => void;
  onNudge: (amount: number) => void;
  onPitchChange: (percent: number) => void;
  onRangeChange: (range: 8 | 16 | 50) => void;
  onResetPitch: () => void;
  onToggleKeyLock: () => void;
  onToggleSlip: () => void;
  onToggleQuantize: () => void;
  onSetAutoLoop: (beats: number) => void;
  onToggleLoop: () => void;
  onHalveLoop: () => void;
  onDoubleLoop: () => void;
  onSetLoopIn: () => void;
  onSetLoopOut: () => void;
  onJumpToCue: (cue: HotCue) => void;
  onSetCue: (id: number) => void;
  onDeleteCue: (id: number) => void;
  onBeatJump: (beats: number) => void;
  onTriggerSample: (sampleId: number) => void;
  onPadFx: (fxType: string) => void;
}

const THEME = {
  cyan: { accent: '#00E5FF', border: 'rgba(0,229,255,0.5)', glow: 'rgba(0,229,255,0.06)' },
  violet: { accent: '#8B5CF6', border: 'rgba(139,92,246,0.5)', glow: 'rgba(139,92,246,0.07)' },
} as const;

export const DjDeck: React.FC<DjDeckProps> = ({
  deck,
  colorScheme,
  onPlayPause,
  onCue,
  onSync,
  onToggleMaster,
  onSeek,
  onScratch,
  onNudge,
  onPitchChange,
  onRangeChange,
  onResetPitch,
  onToggleKeyLock,
  onToggleSlip,
  onToggleQuantize,
  onSetAutoLoop,
  onToggleLoop,
  onHalveLoop,
  onDoubleLoop,
  onSetLoopIn,
  onSetLoopOut,
  onJumpToCue,
  onSetCue,
  onDeleteCue,
  onBeatJump,
  onTriggerSample,
  onPadFx,
}) => {
  const theme = THEME[colorScheme];
  const isPlaying = deck.isPlaying;

  return (
    <section
      aria-label={`Deck ${deck.id}`}
      className="flex flex-col flex-1 min-w-0 min-h-0 bg-[#0D1118] rounded-md overflow-hidden shadow-panel transition-[border-color,box-shadow] duration-300"
      style={{
        border: `1px solid ${isPlaying ? theme.border : '#252D3A'}`,
        boxShadow: isPlaying
          ? `0 0 26px -10px ${theme.glow}, 0 8px 24px -12px rgba(0,0,0,0.8)`
          : '0 8px 24px -12px rgba(0,0,0,0.8)',
      }}
    >
      {/* 1. Deck header: identity + BPM stat strip */}
      <DeckHeader
        deck={deck}
        colorScheme={colorScheme}
        onToggleKeyLock={onToggleKeyLock}
        onToggleSlip={onToggleSlip}
        onToggleQuantize={onToggleQuantize}
      />

      {/* 2. Track overview search strip */}
      <div className="px-2.5 pt-2 shrink-0">
        <div className="flex items-center gap-1.5 mb-1">
          <History size={10} className="text-[#5A6678]" />
          <span className="text-[8px] font-mono font-bold tracking-[0.25em] text-[#5A6678]">TRACK OVERVIEW</span>
        </div>
        <OverviewWaveform
          deck={deck}
          colorScheme={colorScheme}
          onSeek={onSeek}
          height={30}
        />
      </div>

      {/* 3. Turntable platter + precision pitch fader */}
      <div className="flex items-stretch justify-center gap-2.5 px-3 flex-1 min-h-0 py-2">
        <div className="flex-1 flex items-center justify-center min-w-0">
          <div className="origin-center" style={{ transform: 'scale(0.82)' }}>
            <JogWheel
              deck={deck}
              colorScheme={colorScheme}
              size={208}
              onScratch={onScratch}
              onSeek={onSeek}
              onNudge={onNudge}
            />
          </div>
        </div>

        <PitchFader
          deck={deck}
          colorScheme={colorScheme}
          onPitchChange={onPitchChange}
          onRangeChange={onRangeChange}
          onReset={onResetPitch}
        />
      </div>

      {/* 4. Workflow: loops + performance pads */}
      <div className="px-2.5 pb-2 flex flex-col gap-1.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <Zap size={10} className="text-[#5A6678]" />
          <span className="text-[8px] font-mono font-bold tracking-[0.25em] text-[#5A6678]">
            {deck.activePadMode === 'hotcue' ? 'PERFORMANCE PADS' : 'PERFORMANCE PADS'}
          </span>
        </div>
        <PerformancePads
          deck={deck}
          colorScheme={colorScheme}
          onJumpToCue={onJumpToCue}
          onSetCue={onSetCue}
          onDeleteCue={onDeleteCue}
          onBeatJump={onBeatJump}
          onTriggerSample={onTriggerSample}
          onPadFx={onPadFx}
        />
        <LoopSection
          deck={deck}
          colorScheme={colorScheme}
          onSetAutoLoop={onSetAutoLoop}
          onToggleLoop={onToggleLoop}
          onHalveLoop={onHalveLoop}
          onDoubleLoop={onDoubleLoop}
          onSetLoopIn={onSetLoopIn}
          onSetLoopOut={onSetLoopOut}
        />
      </div>

      {/* 5. Hardware transport */}
      <DeckControls
        deck={deck}
        colorScheme={colorScheme}
        onPlayPause={onPlayPause}
        onCue={onCue}
        onSync={onSync}
        onToggleMaster={onToggleMaster}
      />
    </section>
  );
};
