import React from 'react';
import type { DeckState } from '../../types/dj';

interface LoopSectionProps {
  deck: DeckState;
  colorScheme: 'cyan' | 'violet';
  onSetAutoLoop: (beats: number) => void;
  onToggleLoop: () => void;
  onHalveLoop: () => void;
  onDoubleLoop: () => void;
  onSetLoopIn: () => void;
  onSetLoopOut: () => void;
}

const THEME = {
  cyan: { accent: '#00E5FF' },
  violet: { accent: '#8B5CF6' },
} as const;

export const LoopSection: React.FC<LoopSectionProps> = ({
  deck,
  colorScheme,
  onSetAutoLoop,
  onToggleLoop,
  onHalveLoop,
  onDoubleLoop,
  onSetLoopIn,
  onSetLoopOut,
}) => {
  const accent = THEME[colorScheme].accent;
  const loopBeats = [0.5, 1, 2, 4, 8, 16];
  const activeLoopBeats = deck.loop.active ? deck.loop.lengthInBeats : null;

  return (
    <div
      className="bg-[#0A0E14] border rounded-[3px] p-1.5 transition-[border-color] duration-200"
      style={{ borderColor: deck.loop.active ? `${accent}88` : '#1C232E' }}
    >
      <div className="flex items-center gap-1.5">
        {/* Loop header + beat label */}
        <span
          className="text-[8px] font-mono font-bold tracking-[0.25em] shrink-0"
          style={{ color: deck.loop.active ? accent : '#5A6678' }}
        >
          LOOP
        </span>
        {deck.loop.active && (
          <span
            className="text-[8px] font-mono font-bold px-1 py-px rounded-[2px] shrink-0"
            style={{ color: accent, backgroundColor: `${accent}14`, border: `1px solid ${accent}44` }}
          >
            {deck.loop.lengthInBeats} BEAT
          </span>
        )}

        <div className="flex-1" />

        {/* Manual loop controls */}
        <button
          onClick={onSetLoopIn}
          title="Set manual loop in-point at current position"
          className="px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold bg-[#111722] hover:bg-[#161D29] text-[#A7B1C2] border border-[#252D3A] transition-colors"
        >
          IN
        </button>
        <button
          onClick={onSetLoopOut}
          title="Set manual loop out-point and activate"
          className="px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono font-bold bg-[#111722] hover:bg-[#161D29] text-[#A7B1C2] border border-[#252D3A] transition-colors"
        >
          OUT
        </button>
        <button
          onClick={onToggleLoop}
          title="Toggle loop on/off"
          aria-pressed={deck.loop.active}
          className="px-2 py-0.5 rounded-[2px] text-[9px] font-mono font-bold transition-all"
          style={
            deck.loop.active
              ? { color: '#07090D', backgroundColor: accent, border: `1px solid ${accent}` }
              : { color: '#A7B1C2', backgroundColor: '#111722', border: '1px solid #252D3A' }
          }
        >
          {deck.loop.active ? 'EXIT' : 'RELOOP'}
        </button>
      </div>

      {/* Auto loop + halve/double row */}
      <div className="flex items-center gap-1 mt-1">
        {loopBeats.map((beats) => {
          const isActive = deck.loop.active && activeLoopBeats === beats;
          return (
            <button
              key={beats}
              onClick={() => onSetAutoLoop(beats)}
              title={`Set ${beats === 0.5 ? '1/2' : beats}-beat auto loop`}
              aria-pressed={isActive}
              className="flex-1 py-0.5 rounded-[2px] text-[9px] font-mono font-bold transition-all border"
              style={
                isActive
                  ? { color: '#07090D', backgroundColor: accent, borderColor: accent }
                  : { color: '#A7B1C2', backgroundColor: '#10151D', borderColor: '#1C232E' }
              }
            >
              {beats === 0.5 ? '1/2' : beats}
            </button>
          );
        })}

        <button
          onClick={onHalveLoop}
          title="Halve loop length"
          aria-label="Halve loop length"
          className="w-8 py-0.5 rounded-[2px] text-[9px] font-mono font-bold bg-[#111722] hover:bg-[#161D29] text-[#A7B1C2] border border-[#252D3A] transition-colors"
        >
          ½X
        </button>
        <button
          onClick={onDoubleLoop}
          title="Double loop length"
          aria-label="Double loop length"
          className="w-8 py-0.5 rounded-[2px] text-[9px] font-mono font-bold bg-[#111722] hover:bg-[#161D29] text-[#A7B1C2] border border-[#252D3A] transition-colors"
        >
          2X
        </button>
      </div>
    </div>
  );
};
