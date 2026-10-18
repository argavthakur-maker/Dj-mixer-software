import React, { useState } from 'react';
import type { DeckState, HotCue } from '../../types/dj';
import { Volume2, Zap, FastForward } from 'lucide-react';

interface PerformancePadsProps {
  deck: DeckState;
  colorScheme: 'cyan' | 'violet';
  onJumpToCue: (cue: HotCue) => void;
  onSetCue: (id: number) => void;
  onDeleteCue: (id: number) => void;
  onBeatJump: (beats: number) => void;
  onTriggerSample: (sampleId: number) => void;
  onPadFx: (fxType: string) => void;
}

export const PerformancePads: React.FC<PerformancePadsProps> = ({
  deck,
  colorScheme,
  onJumpToCue,
  onSetCue,
  onDeleteCue,
  onBeatJump,
  onTriggerSample,
  onPadFx,
}) => {
  const [padMode, setPadMode] = useState<'hotcue' | 'padfx' | 'beatjump' | 'sampler'>('hotcue');
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // Distinct Hot Cue colors
  const cueColors = [
    '#00E5FF', // Cyan
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#06B6D4', // Teal
  ];

  const samplerLabels = [
    'AIRHORN', 'RISER', 'LASER', '808 SUB',
    '909 HAT', 'CLAP', 'VOCAL', 'REWIND'
  ];

  const beatJumpValues = [-16, -8, -4, -1, 1, 4, 8, 16];

  const padFxList = [
    { label: 'ROLL 1/16', id: 'roll-1-16' },
    { label: 'ROLL 1/8', id: 'roll-1-8' },
    { label: 'ROLL 1/4', id: 'roll-1-4' },
    { label: 'ROLL 1/2', id: 'roll-1-2' },
    { label: 'REPEAT 1B', id: 'repeat' },
    { label: 'HPF SWEEP', id: 'hpf' },
    { label: 'LPF SWEEP', id: 'lpf' },
    { label: 'BRAKE', id: 'brake' },
  ];

  return (
    <div className="flex flex-col gap-1.5 p-2 rounded bg-[#0D1017] border border-[#1E2533]">
      {/* Pad Mode Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#1A212E] pb-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPadMode('hotcue')}
            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all ${
              padMode === 'hotcue'
                ? colorScheme === 'cyan'
                  ? 'bg-cyan-500 text-black shadow-glow-cyan'
                  : 'bg-fuchsia-500 text-black shadow-glow-magenta'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            HOT CUE
          </button>
          <button
            onClick={() => setPadMode('padfx')}
            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all ${
              padMode === 'padfx'
                ? 'bg-amber-500 text-black shadow-glow-amber'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            PAD FX
          </button>
          <button
            onClick={() => setPadMode('beatjump')}
            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all ${
              padMode === 'beatjump'
                ? 'bg-blue-500 text-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BEAT JUMP
          </button>
          <button
            onClick={() => setPadMode('sampler')}
            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all ${
              padMode === 'sampler'
                ? 'bg-emerald-500 text-black shadow-glow-emerald'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SAMPLER
          </button>
        </div>

        {/* Shift Button to Clear Cues */}
        {padMode === 'hotcue' && (
          <button
            onClick={() => setIsShiftPressed(!isShiftPressed)}
            title="Shift: delete assigned Hot Cue"
            className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border transition-colors ${
              isShiftPressed
                ? 'bg-rose-950 text-rose-400 border-rose-500 animate-pulse'
                : 'bg-[#121622] text-slate-500 border-[#252B36] hover:text-slate-300'
            }`}
          >
            {isShiftPressed ? 'DEL CUE' : 'SHIFT'}
          </button>
        )}
      </div>

      {/* 8 Performance Pads (2x4 Grid) */}
      <div className="grid grid-cols-4 gap-1.5">
        {Array.from({ length: 8 }).map((_, idx) => {
          const padId = idx + 1;

          if (padMode === 'hotcue') {
            const cue = deck.hotCues.find((c) => c.id === padId);
            const padColor = cueColors[idx];

            return (
              <button
                key={padId}
                onClick={() => {
                  if (isShiftPressed) {
                    onDeleteCue(padId);
                  } else if (cue) {
                    onJumpToCue(cue);
                  } else {
                    onSetCue(padId);
                  }
                }}
                style={{
                  boxShadow: cue ? `0 0 10px ${padColor}40` : undefined,
                  borderLeft: cue ? `3px solid ${padColor}` : undefined,
                }}
                className={`h-11 rounded flex flex-col items-center justify-center p-1 font-mono transition-all active:scale-95 ${
                  cue
                    ? 'bg-[#151B26] text-white border border-[#2B3545] hover:border-white'
                    : 'bg-[#0E121A] text-slate-600 border border-[#1A212D] hover:bg-[#151A24] hover:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cue ? padColor : '#252B36' }}
                  />
                  <span className="text-[10px] font-bold">{padId}</span>
                </div>
                <span className="text-[8px] truncate max-w-full text-slate-400 mt-0.5">
                  {cue ? `${cue.position.toFixed(1)}s` : 'EMPTY'}
                </span>
              </button>
            );
          }

          if (padMode === 'padfx') {
            const fx = padFxList[idx];
            return (
              <button
                key={padId}
                onClick={() => onPadFx(fx.id)}
                className="h-11 rounded bg-[#121620] hover:bg-amber-950/40 text-amber-300 border border-[#202735] hover:border-amber-500/50 flex flex-col items-center justify-center p-1 font-mono transition-all active:scale-95 text-center"
              >
                <Zap size={11} className="text-amber-400 mb-0.5" />
                <span className="text-[9px] font-bold tracking-tight">{fx.label}</span>
              </button>
            );
          }

          if (padMode === 'beatjump') {
            const jumpBeats = beatJumpValues[idx];
            return (
              <button
                key={padId}
                onClick={() => onBeatJump(jumpBeats)}
                className="h-11 rounded bg-[#121620] hover:bg-blue-950/40 text-blue-300 border border-[#202735] hover:border-blue-500/50 flex flex-col items-center justify-center p-1 font-mono transition-all active:scale-95"
              >
                <FastForward size={11} className={`text-blue-400 mb-0.5 ${jumpBeats < 0 ? 'rotate-180' : ''}`} />
                <span className="text-[9px] font-bold">
                  {jumpBeats > 0 ? `+${jumpBeats}` : jumpBeats}
                </span>
              </button>
            );
          }

          // SAMPLER Mode
          const sampleName = samplerLabels[idx];
          return (
            <button
              key={padId}
              onClick={() => onTriggerSample(padId)}
              className="h-11 rounded bg-[#121620] hover:bg-emerald-950/50 text-emerald-300 border border-[#202735] hover:border-emerald-500/60 flex flex-col items-center justify-center p-1 font-mono transition-all active:scale-95 shadow-inner"
            >
              <Volume2 size={11} className="text-emerald-400 mb-0.5" />
              <span className="text-[8px] font-bold tracking-tight">{sampleName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
