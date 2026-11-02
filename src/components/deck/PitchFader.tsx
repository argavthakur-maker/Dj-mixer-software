import React from 'react';
import type { DeckState } from '../../types/dj';
import { RotateCcw } from 'lucide-react';

interface PitchFaderProps {
  deck: DeckState;
  colorScheme: 'cyan' | 'violet';
  onPitchChange: (percent: number) => void;
  onRangeChange: (range: 8 | 16 | 50) => void;
  onReset: () => void;
}

const THEME = {
  cyan: { accent: '#00E5FF' },
  violet: { accent: '#8B5CF6' },
} as const;

export const PitchFader: React.FC<PitchFaderProps> = ({
  deck,
  colorScheme,
  onPitchChange,
  onRangeChange,
  onReset,
}) => {
  const isZero = Math.abs(deck.pitchPercent) < 0.05;
  const accent = THEME[colorScheme].accent;

  const cycleRange = () => {
    if (deck.pitchRange === 8) onRangeChange(16);
    else if (deck.pitchRange === 16) onRangeChange(50);
    else onRangeChange(8);
  };

  return (
    <div className="flex flex-col items-center justify-between h-full py-2 px-1.5 bg-[#0A0E14] border border-[#252D3A] rounded-[3px] select-none w-[74px] self-stretch">
      {/* Range selector + reset */}
      <div className="flex items-center justify-between w-full gap-0.5">
        <button
          onClick={cycleRange}
          title="Cycle pitch range: ±8% / ±16% / ±50%"
          className="px-1 py-0.5 rounded-[2px] text-[9px] font-mono font-bold bg-[#111722] hover:bg-[#161D29] text-[#A7B1C2] border border-[#252D3A] transition-colors"
        >
          ±{deck.pitchRange}
        </button>

        <button
          onClick={onReset}
          title="Reset pitch to 0%"
          aria-label="Reset pitch"
          className="p-1 rounded-[2px] text-[#5A6678] hover:text-[#00E5FF] hover:bg-[#111722] transition-colors"
        >
          <RotateCcw size={11} />
        </button>
      </div>

      {/* Fader assembly */}
      <div className="relative flex items-center justify-center flex-1 w-full min-h-0">
        {/* Scale ticks */}
        <div className="absolute left-0 flex flex-col justify-between h-[88%] text-[7px] font-mono text-[#5A6678] pointer-events-none text-center leading-none">
          <span>+{deck.pitchRange}</span>
          <span>+{deck.pitchRange / 2}</span>
          <span className={isZero ? 'text-[#37F59A] font-bold' : ''}>0</span>
          <span>-{deck.pitchRange / 2}</span>
          <span>-{deck.pitchRange}</span>
        </div>

        {/* Zero detent LED */}
        <div
          title="Center 0% detent"
          className={`absolute right-0 w-1.5 h-1.5 rounded-full border transition-all ${
            isZero
              ? 'bg-[#37F59A] border-[#37F59A] shadow-glow-warn'
              : 'bg-[#141B26] border-[#252D3A]'
          }`}
          style={isZero ? { boxShadow: '0 0 8px rgba(55,245,154,0.6)' } : undefined}
        />

        <input
          type="range"
          min={-deck.pitchRange}
          max={deck.pitchRange}
          step={0.02}
          value={deck.pitchPercent}
          onChange={(e) => onPitchChange(parseFloat(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); onPitchChange(Math.max(-deck.pitchRange, deck.pitchPercent - 0.05)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); onPitchChange(Math.min(deck.pitchRange, deck.pitchPercent + 0.05)); }
          }}
          aria-label={`Deck ${deck.id} pitch fader`}
          className="vertical-fader h-[88%] z-10"
        />
      </div>

      {/* Percentage readout */}
      <div
        className="text-center font-mono font-bold text-[10px] tabular-nums"
        style={{ color: isZero ? '#37F59A' : accent }}
      >
        {deck.pitchPercent >= 0 ? '+' : ''}
        {deck.pitchPercent.toFixed(1)}%
      </div>
    </div>
  );
};
