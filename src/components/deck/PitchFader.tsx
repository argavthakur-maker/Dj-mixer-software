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

export const PitchFader: React.FC<PitchFaderProps> = ({
  deck,
  colorScheme,
  onPitchChange,
  onRangeChange,
  onReset,
}) => {
  const isZero = Math.abs(deck.pitchPercent) < 0.05;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPitchChange(parseFloat(e.target.value));
  };

  const cycleRange = () => {
    if (deck.pitchRange === 8) onRangeChange(16);
    else if (deck.pitchRange === 16) onRangeChange(50);
    else onRangeChange(8);
  };

  return (
    <div className="flex flex-col items-center justify-between h-[230px] p-2 bg-[#0A0D14] rounded-md border border-[#1A212E] select-none">
      {/* Top Header: Range Selector & Reset */}
      <div className="flex items-center justify-between w-full gap-1">
        <button
          onClick={cycleRange}
          title="Cycle pitch range: ±8%, ±16%, ±50%"
          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#141924] hover:bg-[#1E2536] text-slate-300 border border-[#252B36] transition-colors"
        >
          ±{deck.pitchRange}%
        </button>

        <button
          onClick={onReset}
          title="Reset pitch to 0.0%"
          className="p-1 rounded text-slate-500 hover:text-cyan-400 hover:bg-[#141924] transition-colors"
        >
          <RotateCcw size={11} />
        </button>
      </div>

      {/* Center Track & Fader Area */}
      <div className="relative flex items-center justify-center h-[160px] w-full">
        {/* Scale tick marks */}
        <div className="absolute left-1 flex flex-col justify-between h-[140px] text-[8px] font-mono text-slate-600 pointer-events-none">
          <span>+{deck.pitchRange}</span>
          <span>+{deck.pitchRange / 2}</span>
          <span className={isZero ? 'text-emerald-400 font-bold' : 'text-slate-500'}>0</span>
          <span>-{deck.pitchRange / 2}</span>
          <span>-{deck.pitchRange}</span>
        </div>

        {/* Center Zero Detent LED */}
        <div
          className={`absolute right-1 w-2 h-2 rounded-full border transition-all ${
            isZero
              ? 'bg-emerald-400 border-emerald-300 shadow-glow-emerald'
              : 'bg-[#151D28] border-[#252B36]'
          }`}
          title="Center 0% Detent Indicator"
        />

        {/* Vertical Range Input */}
        <input
          type="range"
          min={-deck.pitchRange}
          max={deck.pitchRange}
          step={0.02}
          value={deck.pitchPercent}
          onChange={handleSliderChange}
          className="vertical-fader h-[140px] z-10"
        />
      </div>

      {/* Bottom Percentage Readout */}
      <div className="w-full text-center">
        <span className={`text-[10px] font-mono font-bold ${
          isZero 
            ? 'text-emerald-400' 
            : colorScheme === 'cyan' 
            ? 'text-cyan-400' 
            : 'text-fuchsia-400'
        }`}>
          {deck.pitchPercent >= 0 ? `+${deck.pitchPercent.toFixed(2)}%` : `${deck.pitchPercent.toFixed(2)}%`}
        </span>
      </div>
    </div>
  );
};
