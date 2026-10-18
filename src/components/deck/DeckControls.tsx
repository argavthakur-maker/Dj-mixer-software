import React from 'react';
import type { DeckState } from '../../types/dj';
import { Play, Pause, ArrowRightLeft } from 'lucide-react';

interface DeckControlsProps {
  deck: DeckState;
  colorScheme: 'cyan' | 'violet';
  onPlayPause: () => void;
  onCue: () => void;
  onSync: () => void;
  onToggleMaster: () => void;
}

export const DeckControls: React.FC<DeckControlsProps> = ({
  deck,
  colorScheme,
  onPlayPause,
  onCue,
  onSync,
  onToggleMaster,
}) => {
  const isPlaying = deck.isPlaying;
  const primaryGlow = colorScheme === 'cyan' ? 'shadow-glow-cyan-lg' : 'shadow-glow-magenta-lg';

  return (
    <div className="flex items-center justify-between gap-3 p-2 bg-[#0E121A] rounded-b-md border-t border-[#1F2633]">
      {/* Left: CUE Button & PLAY/PAUSE Button (Pioneer CDJ Hardware Style) */}
      <div className="flex items-center gap-3">
        {/* Large Round Illuminated CUE Button */}
        <button
          onClick={onCue}
          title="CUE: Press to return to cue point. Hold to preview."
          className={`relative w-14 h-14 rounded-full flex flex-col items-center justify-center font-mono font-extrabold uppercase transition-all duration-100 active:scale-95 border-2 ${
            deck.isPlaying
              ? 'bg-[#181D26] text-amber-500/80 border-[#2B3545] shadow-inner'
              : 'bg-[#221C11] text-amber-400 border-amber-500 shadow-glow-amber'
          }`}
        >
          <div className="absolute inset-1 rounded-full border border-white/10 pointer-events-none" />
          <span className="text-xs tracking-wider">CUE</span>
        </button>

        {/* Large Round Illuminated PLAY / PAUSE Button */}
        <button
          onClick={onPlayPause}
          title="PLAY / PAUSE (Spacebar)"
          className={`relative w-14 h-14 rounded-full flex flex-col items-center justify-center font-mono font-extrabold uppercase transition-all duration-100 active:scale-95 border-2 ${
            isPlaying
              ? colorScheme === 'cyan'
                ? `bg-cyan-500 text-black border-cyan-300 ${primaryGlow}`
                : `bg-fuchsia-500 text-black border-fuchsia-300 ${primaryGlow}`
              : 'bg-[#131E1E] text-emerald-400 border-emerald-500/80 shadow-glow-emerald hover:border-emerald-400'
          }`}
        >
          <div className="absolute inset-1 rounded-full border border-white/20 pointer-events-none" />
          {isPlaying ? (
            <Pause size={18} className="fill-current" />
          ) : (
            <Play size={18} className="fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Right: SYNC & MASTER Buttons */}
      <div className="flex items-center gap-2">
        {/* Master Deck Selector */}
        <button
          onClick={onToggleMaster}
          title="Set this deck as Master BPM Clock"
          className={`px-3 py-2 rounded text-[10px] font-mono font-bold tracking-wider uppercase border transition-all ${
            deck.isMaster
              ? 'bg-amber-500 text-black border-amber-400 shadow-glow-amber font-extrabold'
              : 'bg-[#121620] text-slate-400 border-[#202735] hover:text-white'
          }`}
        >
          MASTER
        </button>

        {/* SYNC Button */}
        <button
          onClick={onSync}
          title="SYNC: Beat match and tempo sync with opposite deck"
          className={`px-3.5 py-2 rounded text-[11px] font-mono font-extrabold tracking-wider uppercase flex items-center gap-1.5 border transition-all ${
            deck.isSync
              ? colorScheme === 'cyan'
                ? 'bg-cyan-400 text-black border-cyan-300 shadow-glow-cyan'
                : 'bg-fuchsia-400 text-black border-fuchsia-300 shadow-glow-magenta'
              : 'bg-[#141A26] text-slate-300 border-[#252E3E] hover:border-slate-400 hover:text-white'
          }`}
        >
          <ArrowRightLeft size={12} />
          SYNC
        </button>
      </div>
    </div>
  );
};
