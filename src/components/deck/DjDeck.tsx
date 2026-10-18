import React from 'react';
import type { DeckState, HotCue } from '../../types/dj';
import { DeckHeader } from './DeckHeader';
import { OverviewWaveform } from '../waveform/OverviewWaveform';
import { JogWheel } from './JogWheel';
import { PitchFader } from './PitchFader';
import { LoopSection } from './LoopSection';
import { PerformancePads } from './PerformancePads';
import { DeckControls } from './DeckControls';

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
  const borderHighlight = colorScheme === 'cyan' ? 'border-[#1E293B] hover:border-cyan-500/40' : 'border-[#1E293B] hover:border-fuchsia-500/40';

  return (
    <div className={`flex flex-col flex-1 bg-[#11151D] border ${borderHighlight} rounded-lg shadow-xl overflow-hidden transition-all duration-200`}>
      {/* 1. Deck Header: Title, Artist, Large BPM, Key, Time */}
      <DeckHeader
        deck={deck}
        colorScheme={colorScheme}
        onToggleKeyLock={onToggleKeyLock}
        onToggleSlip={onToggleSlip}
        onToggleQuantize={onToggleQuantize}
      />

      {/* 2. Overview Waveform / Needle Search */}
      <div className="px-2.5 pt-2">
        <OverviewWaveform
          deck={deck}
          colorScheme={colorScheme}
          onSeek={onSeek}
          height={32}
        />
      </div>

      {/* 3. Turntable Platter & Pitch Fader Section */}
      <div className="flex items-center justify-between px-3 py-2 gap-3">
        {/* Large Jog Wheel with Scratching & Vinyl Grooves */}
        <div className="flex-1 flex justify-center">
          <JogWheel
            deck={deck}
            colorScheme={colorScheme}
            size={185}
            onScratch={onScratch}
            onSeek={onSeek}
            onNudge={onNudge}
          />
        </div>

        {/* Precision Vertical Pitch Fader */}
        <div className="w-16">
          <PitchFader
            deck={deck}
            colorScheme={colorScheme}
            onPitchChange={onPitchChange}
            onRangeChange={onRangeChange}
            onReset={onResetPitch}
          />
        </div>
      </div>

      {/* 4. Auto Loop & Manual Loop Controls */}
      <div className="px-2.5 py-1">
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

      {/* 5. Performance Pads: Hot Cues, Pad FX, Beat Jump, Sampler */}
      <div className="px-2.5 py-1">
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
      </div>

      {/* 6. Hardware Play/Pause, CUE, SYNC Buttons */}
      <div className="mt-auto">
        <DeckControls
          deck={deck}
          colorScheme={colorScheme}
          onPlayPause={onPlayPause}
          onCue={onCue}
          onSync={onSync}
          onToggleMaster={onToggleMaster}
        />
      </div>
    </div>
  );
};

