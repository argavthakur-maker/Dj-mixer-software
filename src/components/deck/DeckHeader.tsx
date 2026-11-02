import React, { useState } from 'react';
import type { DeckState } from '../../types/dj';
import { Lock, LockOpen } from 'lucide-react';
import { TrackArtwork } from '../common/TrackArtwork';

interface DeckHeaderProps {
  deck: DeckState;
  colorScheme: 'cyan' | 'violet';
  onToggleKeyLock: () => void;
  onToggleSlip: () => void;
  onToggleQuantize: () => void;
}

const THEME = {
  cyan: {
    accent: '#00E5FF',
    bright: '#38F6FF',
    badgeBg: 'rgba(0,229,255,0.08)',
    badgeBorder: 'rgba(0,229,255,0.4)',
  },
  violet: {
    accent: '#8B5CF6',
    bright: '#D946EF',
    badgeBg: 'rgba(139,92,246,0.1)',
    badgeBorder: 'rgba(139,92,246,0.45)',
  },
} as const;

export const DeckHeader: React.FC<DeckHeaderProps> = ({
  deck,
  colorScheme,
  onToggleKeyLock,
  onToggleSlip,
  onToggleQuantize,
}) => {
  const [showRemaining, setShowRemaining] = useState(false);
  const theme = THEME[colorScheme];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const track = deck.track;
  const remaining = track ? Math.max(0, track.duration - deck.currentTime) : 0;
  const displayTime = showRemaining ? `-${formatTime(remaining)}` : formatTime(deck.currentTime);

  // Camelot color mapping for harmonic mixing cues
  const getCamelotColor = (key: string) => {
    const num = parseInt(key) || 8;
    const colors = ['#FF3B57', '#FFBF47', '#37F59A', '#00E5FF', '#38F6FF', '#3B82F6', '#8B5CF6', '#D946EF', '#EC4899', '#F43F5E', '#84CC16', '#06B6D4'];
    return colors[(num - 1) % colors.length];
  };

  const isPlaying = deck.isPlaying;
  const lowTime = showRemaining && remaining < 30;

  return (
    <div className="bg-[#0D1118] border-b border-[#252D3A] px-3 pt-2.5 pb-2">
      {/* Top row: identity + mode buttons */}
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Deck badge with illumination */}
          <div
            className="px-2 py-1 rounded-[3px] text-[11px] font-mono font-extrabold tracking-[0.15em] shrink-0 border"
            style={{
              color: isPlaying ? '#F4F7FC' : theme.accent,
              backgroundColor: theme.badgeBg,
              borderColor: theme.badgeBorder,
              boxShadow: isPlaying ? `0 0 12px -3px ${theme.accent}` : 'none',
            }}
          >
            {deck.id}
          </div>

          <TrackArtwork track={track} size={40} className="rounded-[3px] shrink-0" />

          <div className="flex flex-col min-w-0 flex-1">
            <span
              className="text-[13px] font-semibold text-[#F4F7FC] truncate leading-tight"
              title={track ? track.title : 'No Track Loaded'}
            >
              {track ? track.title : 'NO TRACK LOADED'}
            </span>
            <span className="text-[10px] text-[#8490A3] truncate mt-px font-medium" title={track?.artist}>
              {track ? track.artist : 'Load a track from the library'}
            </span>
          </div>
        </div>

        {/* Mode indicators */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleQuantize}
            title="Quantize: snap cue points and loops to the beat grid"
            aria-pressed={deck.isQuantize}
            className={`px-2 py-1 rounded-[3px] text-[9px] font-mono font-bold tracking-[0.12em] transition-colors border ${
              deck.isQuantize
                ? 'text-[#FFBF47] border-[#FFBF47]/50 bg-[#FFBF47]/5'
                : 'text-[#5A6678] border-[#252D3A] bg-[#0A0E14] hover:text-[#8490A3]'
            }`}
          >
            QNTZ
          </button>

          <button
            onClick={onToggleSlip}
            title="Slip mode: track continues under scratches and loops"
            aria-pressed={deck.isSlipMode}
            className={`px-2 py-1 rounded-[3px] text-[9px] font-mono font-bold tracking-[0.12em] transition-colors border ${
              deck.isSlipMode
                ? 'text-[#00E5FF] border-[#00E5FF]/50 bg-[#00E5FF]/5'
                : 'text-[#5A6678] border-[#252D3A] bg-[#0A0E14] hover:text-[#8490A3]'
            }`}
          >
            SLIP
          </button>

          <button
            onClick={onToggleKeyLock}
            title="Key lock: preserve pitch when changing BPM"
            aria-pressed={deck.isKeyLocked}
            className={`p-1.5 rounded-[3px] transition-colors border ${
              deck.isKeyLocked
                ? 'text-[#D946EF] border-[#D946EF]/50 bg-[#D946EF]/5'
                : 'text-[#5A6678] border-[#252D3A] bg-[#0A0E14] hover:text-[#8490A3]'
            }`}
          >
            {deck.isKeyLocked ? <Lock size={12} /> : <LockOpen size={12} />}
          </button>
        </div>
      </div>

      {/* Stat strip: BPM (hero) | pitch | key | time */}
      <div className="mt-2 grid grid-cols-[1.4fr_1fr_0.9fr_1fr] gap-px bg-[#252D3A]/60 border border-[#1C232E] rounded-[3px] overflow-hidden">
        {/* BPM — most prominent readout on the deck */}
        <div className="bg-[#07090D] px-2.5 py-1.5">
          <span className="text-[8px] font-mono font-bold tracking-[0.22em] text-[#5A6678]">BPM</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className="font-sans font-bold text-[26px] leading-none tabular-nums"
              style={{ color: isPlaying ? theme.accent : '#F4F7FC' }}
            >
              {deck.currentBpm.toFixed(1)}
            </span>
            <span className="text-[9px] font-mono text-[#8490A3] tabular-nums">
              /{deck.bpm.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Pitch offset */}
        <div className="bg-[#07090D] px-2.5 py-1.5 border-l border-[#1C232E]">
          <span className="text-[8px] font-mono font-bold tracking-[0.22em] text-[#5A6678]">PITCH</span>
          <div
            className="font-mono font-bold text-[14px] leading-[26px] tabular-nums"
            style={{
              color:
                Math.abs(deck.pitchPercent) < 0.01
                  ? '#37F59A'
                  : deck.pitchPercent > 0
                  ? theme.accent
                  : '#FFBF47',
            }}
          >
            {deck.pitchPercent >= 0 ? '+' : ''}
            {deck.pitchPercent.toFixed(2)}%
          </div>
        </div>

        {/* Musical key */}
        <div className="bg-[#07090D] px-2.5 py-1.5 border-l border-[#1C232E]">
          <span className="text-[8px] font-mono font-bold tracking-[0.22em] text-[#5A6678]">KEY</span>
          <div className="flex items-center gap-1 mt-0.5">
            {track ? (
              <>
                <span
                  className="px-1 rounded-[2px] text-[10px] font-mono font-extrabold text-[#07090D]"
                  style={{ backgroundColor: getCamelotColor(track.key) }}
                >
                  {track.key}
                </span>
                <span className="text-[10px] font-mono font-semibold text-[#A7B1C2] leading-none">
                  {track.keyMusical || '--'}
                </span>
              </>
            ) : (
              <span className="text-[10px] font-mono text-[#5A6678]">--</span>
            )}
          </div>
        </div>

        {/* Time display */}
        <button
          onClick={() => setShowRemaining(!showRemaining)}
          title="Toggle elapsed / remaining time"
          className="bg-[#07090D] px-2.5 py-1.5 border-l border-[#1C232E] text-right cursor-pointer hover:bg-[#0A0E14] transition-colors"
        >
          <span className="text-[8px] font-mono font-bold tracking-[0.22em] text-[#5A6678]">
            {showRemaining ? 'REMAIN' : 'ELAPSED'}
          </span>
          <div
            className={`font-mono font-bold text-[15px] leading-none mt-1.5 tabular-nums ${
              lowTime ? 'text-[#FF3B57]' : 'text-[#F4F7FC]'
            }`}
          >
            {displayTime}
          </div>
        </button>
      </div>
    </div>
  );
};
