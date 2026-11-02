import React, { useState } from 'react';
import type { DeckState, HotCue } from '../../types/dj';

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

type PadMode = 'hotcue' | 'padfx' | 'beatjump' | 'sampler';

const SAMPLER_LABELS = [
  'AIRHORN', 'RISER', 'LASER', '808 SUB',
  '909 HAT', 'CLAP', 'VOCAL', 'REWIND',
];

const BEAT_JUMP_VALUES = [-16, -8, -4, -1, 1, 4, 8, 16];

const PAD_FX_LIST = [
  { label: 'ROLL 1/16', id: 'roll-1-16' },
  { label: 'ROLL 1/8', id: 'roll-1-8' },
  { label: 'ROLL 1/4', id: 'roll-1-4' },
  { label: 'ROLL 1/2', id: 'roll-1-2' },
  { label: 'BRAKE', id: 'brake' },
  { label: 'KICK 1', id: 'kick' },
  { label: 'KICK 2', id: 'kick2' },
  { label: 'KICK 4', id: 'kick4' },
];

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
  const [padMode, setPadMode] = useState<PadMode>('hotcue');
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  const accent = colorScheme === 'cyan' ? '#00E5FF' : '#8B5CF6';
  const accent2 = colorScheme === 'cyan' ? '#38F6FF' : '#D946EF';

  const cueColors = [
    '#00E5FF', '#8B5CF6', '#D946EF', '#FFBF47',
    '#37F59A', '#38F6FF', '#FF3B57', '#A7B1C2',
  ];

  const modeButtons: Array<{ mode: PadMode; label: string; color: string }> = [
    { mode: 'hotcue', label: 'HOT CUE', color: accent },
    { mode: 'padfx', label: 'PAD FX', color: '#FFBF47' },
    { mode: 'beatjump', label: 'BEAT JUMP', color: '#38F6FF' },
    { mode: 'sampler', label: 'SAMPLER', color: '#37F59A' },
  ];

  return (
    <div className="bg-[#0A0E14] border border-[#1C232E] rounded-[3px] p-1.5">
      {/* Mode selector */}
      <div className="flex items-center gap-1 pb-1">
        {modeButtons.map(({ mode, label, color }) => (
          <button
            key={mode}
            onClick={() => setPadMode(mode)}
            aria-pressed={padMode === mode}
            className={`flex-1 py-0.5 rounded-[2px] text-[8px] font-mono font-bold tracking-[0.12em] transition-all border ${
              padMode === mode ? '' : 'text-[#5A6678] border-transparent hover:text-[#A7B1C2]'
            }`}
            style={
              padMode === mode
                ? { color: '#07090D', backgroundColor: color, borderColor: color }
                : undefined
            }
          >
            {label}
          </button>
        ))}

        {padMode === 'hotcue' && (
          <button
            onClick={() => setIsShiftPressed(!isShiftPressed)}
            title={isShiftPressed ? 'Now press a pad to delete its cue' : 'Shift: press a pad to delete its assigned cue'}
            aria-pressed={isShiftPressed}
            className={`px-1.5 py-0.5 rounded-[2px] text-[8px] font-mono font-bold tracking-wider border transition-colors ${
              isShiftPressed
                ? 'text-[#FF3B57] border-[#FF3B57]/60 bg-[#FF3B57]/10 animate-pulse-rec'
                : 'text-[#8490A3] border-[#252D3A] bg-[#111722] hover:text-[#F4F7FC]'
            }`}
          >
            {isShiftPressed ? 'DELETE?' : 'SHIFT'}
          </button>
        )}
      </div>

      {/* 8 pads: 4 columns x 2 rows */}
      <div className="grid grid-cols-4 gap-1">
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
                    setIsShiftPressed(false);
                  } else if (cue) {
                    onJumpToCue(cue);
                  } else {
                    onSetCue(padId);
                  }
                }}
                title={cue ? `Jump to ${cue.label} at ${cue.position.toFixed(1)}s` : isShiftPressed ? 'Press to delete' : 'Press to set cue at current position'}
                aria-label={
                  cue ? `Hot cue ${padId}: ${cue.label}` : `Hot cue ${padId}: not set`
                }
                className="h-[30px] rounded-[2px] flex flex-col items-center justify-center transition-all active:scale-95"
                style={{
                  backgroundColor: cue ? `${padColor}14` : '#10151D',
                  border: `1px solid ${cue ? `${padColor}66` : '#1C232E'}`,
                  boxShadow: cue ? `0 0 9px -4px ${padColor}` : 'none',
                }}
              >
                <div className="flex items-center gap-1 leading-none">
                  <span
                    className={`w-1 h-1 rounded-full ${
                      cue ? '' : 'bg-[#252D3A]'
                    }`}
                    style={cue ? { backgroundColor: padColor } : undefined}
                  />
                  <span
                    className="text-[10px] font-mono font-bold leading-none"
                    style={{ color: cue ? '#F4F7FC' : '#5A6678' }}
                  >
                    {padId}
                  </span>
                </div>
                <span
                  className="text-[7px] font-mono tabular-nums mt-0.5 leading-none"
                  style={{ color: cue ? padColor : '#3D4654' }}
                >
                  {cue ? `${cue.position.toFixed(1)}s` : '— —'}
                </span>
              </button>
            );
          }

          if (padMode === 'padfx') {
            const fx = PAD_FX_LIST[idx];
            return (
              <button
                key={padId}
                onClick={() => onPadFx(fx.id)}
                title={`Trigger ${fx.label} on deck ${deck.id}`}
                aria-label={`Pad FX ${fx.label}`}
                className="h-[30px] rounded-[2px] flex items-center justify-center text-[8px] font-mono font-bold tracking-tight text-center px-0.5 transition-all active:scale-95 text-[#FFBF47]"
                style={{ backgroundColor: '#10151D', border: '1px solid #1C232E' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,191,71,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1C232E'; }}
              >
                {fx.label}
              </button>
            );
          }

          if (padMode === 'beatjump') {
            const jumpBeats = BEAT_JUMP_VALUES[idx];
            return (
              <button
                key={padId}
                onClick={() => onBeatJump(jumpBeats)}
                title={`Beat jump ${jumpBeats > 0 ? '+' : ''}${jumpBeats} beats`}
                aria-label={`Beat jump ${jumpBeats} beats`}
                className="h-[30px] rounded-[2px] flex flex-col items-center justify-center font-mono transition-all active:scale-95 text-[#38F6FF]"
                style={{ backgroundColor: '#10151D', border: '1px solid #1C232E' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(56,246,255,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1C232E'; }}
              >
                <span className="text-[11px] font-bold leading-none">
                  {jumpBeats > 0 ? `+${jumpBeats}` : jumpBeats}
                </span>
                <span className="text-[6px] tracking-[0.2em] mt-0.5 leading-none text-[#5A6678]">BEAT</span>
              </button>
            );
          }

          // Sampler mode
          return (
            <button
              key={padId}
              onClick={() => onTriggerSample(padId)}
              title={`Trigger sampler ${padId}: ${SAMPLER_LABELS[idx]}`}
              aria-label={`Sampler ${SAMPLER_LABELS[idx]}`}
              className="h-[30px] rounded-[2px] flex flex-col items-center justify-center font-mono transition-all active:scale-95 text-[#37F59A]"
              style={{ backgroundColor: '#10151D', border: '1px solid #1C232E' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(55,245,154,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1C232E'; }}
            >
              <span className="text-[10px] font-bold leading-none">{padId}</span>
              <span className="text-[6px] tracking-tight mt-0.5 leading-none text-[#5A6678] truncate max-w-full">
                {SAMPLER_LABELS[idx]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Context hint strip */}
      <div className="flex items-center justify-between pt-1 mt-1 border-t border-[#141B26]">
        <span className="text-[7px] font-mono tracking-[0.18em] text-[#3D4654]">
          {padMode === 'hotcue'
            ? '1-4 SET · PLAY JUMPS · SHIFT+PAD DELETES'
            : padMode === 'sampler'
            ? 'SYNTHESIZED SAMPLES · TRIGGER ON PRESS'
            : padMode === 'beatjump'
            ? 'JUMP ±1/4/8/16 BEATS · QUANTIZED TO GRID'
            : 'ROLLS LOOP · BRAKE PITCH BEND'}
        </span>
        <span
          className="text-[7px] font-mono font-bold tracking-[0.18em]"
          style={{ color: accent2 + 'AA' }}
        >
          DECK {deck.id}
        </span>
      </div>
    </div>
  );
};
