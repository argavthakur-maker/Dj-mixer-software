import React, { useState } from 'react';
import type { DeckState } from '../../types/dj';
import { Lock } from 'lucide-react';

interface DeckHeaderProps {
  deck: DeckState;
  colorScheme: 'cyan' | 'violet';
  onToggleKeyLock: () => void;
  onToggleSlip: () => void;
  onToggleQuantize: () => void;
}

export const DeckHeader: React.FC<DeckHeaderProps> = ({
  deck,
  colorScheme,
  onToggleKeyLock,
  onToggleSlip,
  onToggleQuantize,
}) => {
  const [showRemaining, setShowRemaining] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hundredths = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  const track = deck.track;
  const elapsed = deck.currentTime;
  const remaining = track ? Math.max(0, track.duration - elapsed) : 0;
  const displayTime = showRemaining ? `-${formatTime(remaining)}` : formatTime(elapsed);

  // Camelot color mapping for harmonic mixing visual cues
  const getCamelotColor = (key: string) => {
    const num = parseInt(key) || 8;
    const colors = [
      '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#00E5FF',
      '#3B82F6', '#8B5CF6', '#A855F7', '#EC4899', '#F43F5E', '#84CC16'
    ];
    return colors[(num - 1) % colors.length];
  };

  const primaryGlow = colorScheme === 'cyan' ? 'shadow-glow-cyan' : 'shadow-glow-magenta';
  const badgeBg = colorScheme === 'cyan' ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40' : 'bg-fuchsia-950/80 text-fuchsia-400 border-fuchsia-500/40';

  return (
    <div className="flex flex-col gap-2 p-2.5 rounded-t-md bg-[#11151D] border-b border-[#252B36]">
      {/* Top Row: Deck Badge + Title & Artist + Mode Badges */}
      <div className="flex items-center justify-between gap-3">
        {/* Left: Deck Indicator + Track Metadata */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`px-2 py-1 rounded text-xs font-mono font-bold tracking-wider border ${badgeBg} ${primaryGlow}`}>
            DECK {deck.id}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate max-w-[220px] leading-tight">
              {track ? track.title : 'No Track Loaded'}
            </span>
            <span className="text-xs text-slate-400 truncate max-w-[200px]">
              {track ? track.artist : 'Drag a track from library to load'}
            </span>
          </div>
        </div>

        {/* Right: Master, Sync, Quantize, Slip toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleQuantize}
            title="Quantize: snap cue and loops to nearest beat"
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all border ${
              deck.isQuantize
                ? 'bg-amber-950/80 text-amber-400 border-amber-500/50 shadow-glow-amber'
                : 'bg-[#0A0D13] text-slate-500 border-[#252B36] hover:text-slate-300'
            }`}
          >
            QTZ
          </button>

          <button
            onClick={onToggleSlip}
            title="Slip Mode: track continues playing in background during scratching and loops"
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase transition-all border ${
              deck.isSlipMode
                ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/50 shadow-glow-cyan'
                : 'bg-[#0A0D13] text-slate-500 border-[#252B36] hover:text-slate-300'
            }`}
          >
            SLIP
          </button>

          <button
            onClick={onToggleKeyLock}
            title="Key Lock / Master Tempo: preserves pitch when changing BPM"
            className={`p-1.5 rounded transition-all border ${
              deck.isKeyLocked
                ? 'bg-purple-950/80 text-purple-400 border-purple-500/50 shadow-glow-violet'
                : 'bg-[#0A0D13] text-slate-500 border-[#252B36] hover:text-slate-300'
            }`}
          >
            <Lock size={12} />
          </button>
        </div>
      </div>

      {/* Bottom Row: Large High-Density DJ Readouts (BPM, Pitch %, Time, Key) */}
      <div className="grid grid-cols-4 gap-2 items-center bg-[#090B10] p-2 rounded border border-[#1A212E]">
        {/* 1. Large Virtual BPM */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">BPM</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-mono font-extrabold text-white tracking-tight leading-none">
              {deck.currentBpm.toFixed(2)}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            BASE: {deck.bpm.toFixed(1)}
          </span>
        </div>

        {/* 2. Pitch Percentage Offset */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">TEMPO / PITCH</span>
          <span className={`text-base font-mono font-bold leading-none ${
            Math.abs(deck.pitchPercent) < 0.01 
              ? 'text-emerald-400' 
              : deck.pitchPercent > 0 
              ? 'text-cyan-400' 
              : 'text-amber-400'
          }`}>
            {deck.pitchPercent >= 0 ? `+${deck.pitchPercent.toFixed(2)}%` : `${deck.pitchPercent.toFixed(2)}%`}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            ±{deck.pitchRange}%
          </span>
        </div>

        {/* 3. Musical Key & Camelot Harmonic Mixing Code */}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider">KEY</span>
          <div className="flex items-center gap-1.5">
            {track ? (
              <>
                <span
                  className="px-1.5 py-0.5 rounded text-[11px] font-mono font-extrabold text-black"
                  style={{ backgroundColor: getCamelotColor(track.key) }}
                >
                  {track.key}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-300">
                  {track.keyMusical || 'Am'}
                </span>
              </>
            ) : (
              <span className="text-xs font-mono text-slate-600">--</span>
            )}
          </div>
          <span className="text-[9px] font-mono text-slate-500">
            {deck.isKeyLocked ? 'KEY LOCKED' : 'VARIABLE'}
          </span>
        </div>

        {/* 4. Large Digital Time Display */}
        <div
          onClick={() => setShowRemaining(!showRemaining)}
          title="Click to toggle Elapsed / Remaining time"
          className="flex flex-col cursor-pointer group text-right"
        >
          <div className="flex items-center justify-end gap-1">
            <span className="text-[9px] font-mono uppercase text-slate-500 group-hover:text-cyan-400 transition-colors">
              {showRemaining ? 'REMAIN' : 'ELAPSED'}
            </span>
          </div>
          <span className={`text-base font-mono font-bold leading-none tracking-wider ${
            showRemaining && remaining < 30 ? 'text-rose-400 animate-pulse' : 'text-slate-100'
          }`}>
            {displayTime}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            TOTAL {formatTime(track ? track.duration : 0)}
          </span>
        </div>
      </div>
    </div>
  );
};
