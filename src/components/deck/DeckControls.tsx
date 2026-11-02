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

const THEME = {
  cyan: { accent: '#00E5FF', glowClass: 'shadow-glow-cyan' },
  violet: { accent: '#8B5CF6', glowClass: 'shadow-glow-violet' },
} as const;

export const DeckControls: React.FC<DeckControlsProps> = ({
  deck,
  colorScheme,
  onPlayPause,
  onCue,
  onSync,
  onToggleMaster,
}) => {
  const isPlaying = deck.isPlaying;
  const theme = THEME[colorScheme];

  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-[#0A0E14] border-t border-[#252D3A]">
      {/* Left: CUE + PLAY/PAUSE */}
      <div className="flex items-center gap-3">
        {/* Cue button */}
        <button
          onClick={onCue}
          title="CUE: press while playing to return to the cue point; while stopped, set the cue to the current position"
          aria-label="Cue"
          className={`relative w-[46px] h-[46px] rounded-full flex items-center justify-center font-mono font-extrabold text-[10px] tracking-[0.1em] transition-all active:scale-95 ${
            isPlaying
              ? 'bg-[#111722] text-[#FFBF47]/70 border border-[#2A3444] shadow-inset'
              : 'bg-[#181510] text-[#FFBF47] border border-[#FFBF47]/60 shadow-glow-warn'
          }`}
        >
          <span className="absolute inset-1 rounded-full border border-white/5 pointer-events-none" />
          CUE
        </button>

        {/* Play / Pause */}
        <button
          onClick={onPlayPause}
          title={`Play / pause deck ${deck.id}`}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          aria-pressed={isPlaying}
          className={`relative w-[46px] h-[46px] rounded-full flex items-center justify-center transition-all active:scale-95 border ${
            isPlaying
              ? `bg-[#0D1118] border-2 ${theme.glowClass}`
              : 'bg-[#0E1512] border border-[#37F59A]/60 shadow-glow-warn'
          }`}
          style={isPlaying ? { borderColor: theme.accent, color: theme.accent } : { color: '#37F59A' }}
        >
          <span className="absolute inset-[3px] rounded-full border border-white/8 pointer-events-none" />
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
        </button>
      </div>

      {/* Right: MASTER + SYNC */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMaster}
          title="Use this deck as the master BPM clock"
          aria-pressed={deck.isMaster}
          className={`px-3 py-2 rounded-[3px] text-[10px] font-mono font-bold tracking-[0.15em] transition-all border ${
            deck.isMaster
              ? 'text-[#FFBF47] border-[#FFBF47]/60 bg-[#FFBF47]/5 shadow-glow-warn'
              : 'text-[#8490A3] border-[#252D3A] bg-[#111722] hover:text-[#F4F7FC]'
          }`}
        >
          MASTER
        </button>

        <button
          onClick={onSync}
          title="Beat match tempo with the opposite deck"
          aria-pressed={deck.isSync}
          className={`px-3 py-2 rounded-[3px] text-[10px] font-mono font-extrabold tracking-[0.15em] flex items-center gap-1.5 transition-all border ${
            deck.isSync
              ? `bg-[#0D1118] ${theme.glowClass}`
              : 'text-[#A7B1C2] border-[#252D3A] bg-[#111722] hover:text-[#F4F7FC]'
          }`}
          style={
            deck.isSync
              ? { borderColor: theme.accent, color: '#07090D', backgroundColor: theme.accent }
              : undefined
          }
        >
          <ArrowRightLeft size={13} />
          SYNC
        </button>
      </div>
    </div>
  );
};
