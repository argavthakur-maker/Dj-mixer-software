import React, { useRef } from 'react';
import type { DeckState } from '../../types/dj';

interface OverviewWaveformProps {
  deck: DeckState;
  colorScheme: 'cyan' | 'violet';
  onSeek: (time: number) => void;
  height?: number;
}

export const OverviewWaveform: React.FC<OverviewWaveformProps> = ({
  deck,
  colorScheme,
  onSeek,
  height = 36,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !deck.track) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * deck.track.duration);
  };

  const progressPercent = deck.track && deck.track.duration > 0
    ? (deck.currentTime / deck.track.duration) * 100
    : 0;

  const primaryColor = colorScheme === 'cyan' ? '#00E5FF' : '#D946EF';
  const playedTint = colorScheme === 'cyan' ? 'rgba(0, 229, 255, 0.22)' : 'rgba(217, 70, 239, 0.22)';

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{ height }}
      className="relative w-full rounded bg-[#0A0D14] border border-[#1A212E] cursor-pointer overflow-hidden group hover:border-[#2E384D] transition-colors"
    >
      {/* Played time progress overlay */}
      <div
        className="absolute top-0 bottom-0 left-0 pointer-events-none transition-all duration-75"
        style={{
          width: `${progressPercent}%`,
          background: playedTint,
          borderRight: `2px solid ${primaryColor}`,
        }}
      />

      {/* Mini waveform bars */}
      <div className="absolute inset-0 flex items-center px-1 gap-[1px]">
        {deck.track?.waveformData ? (
          // Downsample waveform data to 120 bars for smooth display
          Array.from({ length: 90 }).map((_, idx) => {
            const dataIdx = Math.floor((idx / 90) * deck.track!.waveformData!.length);
            const val = deck.track!.waveformData![dataIdx] || 0.1;
            const barH = Math.max(4, Math.round(val * (height - 8)));
            const isPassed = (idx / 90) * 100 <= progressPercent;

            return (
              <div
                key={idx}
                className="flex-1 rounded-[0.5px] transition-colors"
                style={{
                  height: `${barH}px`,
                  backgroundColor: isPassed
                    ? primaryColor
                    : colorScheme === 'cyan' ? '#1E293B' : '#2A1B38',
                }}
              />
            );
          })
        ) : (
          <div className="w-full text-center text-[10px] font-mono text-slate-600">
            No track loaded
          </div>
        )}
      </div>

      {/* Loop active region marker */}
      {deck.loop.active && deck.track && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none border-x-2 border-amber-400 bg-amber-400/20"
          style={{
            left: `${(deck.loop.start / deck.track.duration) * 100}%`,
            width: `${((deck.loop.end - deck.loop.start) / deck.track.duration) * 100}%`,
          }}
        />
      )}

      {/* Hot Cues pins */}
      {deck.track && deck.hotCues.map((cue) => {
        const leftPercent = (cue.position / deck.track!.duration) * 100;
        return (
          <div
            key={cue.id}
            className="absolute top-0 bottom-0 w-[2px] pointer-events-none"
            style={{ left: `${leftPercent}%`, backgroundColor: cue.color }}
          >
            <div
              className="w-2 h-2 -ml-[3px] rounded-full"
              style={{ backgroundColor: cue.color }}
            />
          </div>
        );
      })}

      {/* Needle search hover line */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
        <div className="h-full w-[1px] bg-white/40 shadow-glow-cyan" />
      </div>
    </div>
  );
};

