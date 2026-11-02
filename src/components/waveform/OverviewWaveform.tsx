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
  height = 32,
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

  const primaryColor = colorScheme === 'cyan' ? '#20C8F4' : '#A855F7';
  const playedTint = colorScheme === 'cyan' ? 'rgba(32, 200, 244, 0.18)' : 'rgba(168, 85, 247, 0.18)';

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{ height }}
      className="relative w-full rounded-md bg-[#080D16] border border-[#26364A] cursor-pointer overflow-hidden group hover:border-[#374960] transition-colors select-none"
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
      <div className="absolute inset-0 flex items-center px-1.5 gap-[1px]">
        {deck.track?.waveformData ? (
          Array.from({ length: 90 }).map((_, idx) => {
            const dataIdx = Math.floor((idx / 90) * deck.track!.waveformData!.length);
            const val = deck.track!.waveformData![dataIdx] || 0.1;
            const barH = Math.max(3, Math.round(val * (height - 8)));
            const isPassed = (idx / 90) * 100 <= progressPercent;

            return (
              <div
                key={idx}
                className="flex-1 rounded-[0.5px] transition-colors"
                style={{
                  height: `${barH}px`,
                  backgroundColor: isPassed ? primaryColor : '#141F30',
                }}
              />
            );
          })
        ) : (
          <div className="w-full text-center text-[11px] font-mono text-[#73849B]">
            No track loaded
          </div>
        )}
      </div>

      {/* Loop active region marker */}
      {deck.loop.active && deck.track && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none border-x-2 border-[#FBBF24] bg-[#FBBF24]/15"
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
    </div>
  );
};
