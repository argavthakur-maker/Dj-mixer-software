import React from 'react';
import type { DeckState } from '../../types/dj';
import { Repeat } from 'lucide-react';

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
  const loopBeats = [0.5, 1, 2, 4, 8, 16];
  const activeLoopBeats = deck.loop.active ? deck.loop.lengthInBeats : null;

  return (
    <div className={`flex flex-col gap-1.5 p-2 rounded bg-[#0D1017] border transition-all ${
      deck.loop.active 
        ? (colorScheme === 'cyan' ? 'border-cyan-500/70 shadow-glow-cyan' : 'border-fuchsia-500/70 shadow-glow-magenta')
        : 'border-[#1E2533]'
    }`}>
      {/* Top Header Row: Loop In / Out / Reloop */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <Repeat size={12} className={deck.loop.active ? (colorScheme === 'cyan' ? 'text-cyan-400' : 'text-fuchsia-400') : 'text-slate-500'} />
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">LOOP</span>
          {deck.loop.active && (
            <span className="text-[9px] font-mono font-bold px-1 rounded bg-amber-950/70 text-amber-400 border border-amber-500/30 animate-pulse">
              {deck.loop.lengthInBeats} BEAT
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onSetLoopIn}
            title="Set Manual Loop In Point"
            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#141924] hover:bg-[#1E2536] text-slate-300 border border-[#252B36] transition-colors"
          >
            IN
          </button>
          <button
            onClick={onSetLoopOut}
            title="Set Manual Loop Out Point"
            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#141924] hover:bg-[#1E2536] text-slate-300 border border-[#252B36] transition-colors"
          >
            OUT
          </button>
          <button
            onClick={onToggleLoop}
            title="Toggle Loop On/Off"
            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border transition-all ${
              deck.loop.active
                ? 'bg-amber-500 text-black border-amber-400 shadow-glow-amber'
                : 'bg-[#141924] text-slate-400 border-[#252B36] hover:text-white'
            }`}
          >
            {deck.loop.active ? 'EXIT' : 'RELOOP'}
          </button>
        </div>
      </div>

      {/* Auto Loop Beat Grid Buttons: 1/2, 1, 2, 4, 8, 16 beats */}
      <div className="grid grid-cols-6 gap-1">
        {loopBeats.map((beats) => {
          const isActive = deck.loop.active && activeLoopBeats === beats;
          return (
            <button
              key={beats}
              onClick={() => onSetAutoLoop(beats)}
              className={`py-1 rounded text-[10px] font-mono font-bold transition-all border ${
                isActive
                  ? colorScheme === 'cyan'
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-glow-cyan'
                    : 'bg-fuchsia-500 text-black border-fuchsia-400 shadow-glow-magenta'
                  : 'bg-[#121620] hover:bg-[#1A212E] text-slate-300 border-[#202735]'
              }`}
            >
              {beats === 0.5 ? '1/2' : beats}
            </button>
          );
        })}
      </div>

      {/* Halve / Double Loop Length */}
      <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-[#18202C]">
        <button
          onClick={onHalveLoop}
          title="Halve Loop Length (1/2x)"
          className="flex-1 py-0.5 rounded text-[9px] font-mono font-bold bg-[#11151F] hover:bg-[#1A212E] text-slate-400 hover:text-white border border-[#202735] transition-colors text-center"
        >
          1/2X
        </button>
        <button
          onClick={onDoubleLoop}
          title="Double Loop Length (2x)"
          className="flex-1 py-0.5 rounded text-[9px] font-mono font-bold bg-[#11151F] hover:bg-[#1A212E] text-slate-400 hover:text-white border border-[#202735] transition-colors text-center"
        >
          2X
        </button>
      </div>
    </div>
  );
};
