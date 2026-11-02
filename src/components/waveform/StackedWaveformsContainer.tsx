import React, { useState } from 'react';
import type { DeckState } from '../../types/dj';
import { ScrollingWaveform } from './ScrollingWaveform';
import { ZoomIn, ZoomOut, Grid, Activity } from 'lucide-react';

interface StackedWaveformsContainerProps {
  deckA: DeckState;
  deckB: DeckState;
  onSeekDeckA: (time: number) => void;
  onSeekDeckB: (time: number) => void;
  onScratchDeckA?: (delta: number) => void;
  onScratchDeckB?: (delta: number) => void;
}

export const StackedWaveformsContainer: React.FC<StackedWaveformsContainerProps> = ({
  deckA,
  deckB,
  onSeekDeckA,
  onSeekDeckB,
  onScratchDeckA,
  onScratchDeckB,
}) => {
  const [zoom, setZoom] = useState(130); // pixels per second
  const [showBeatGrid, setShowBeatGrid] = useState(true);

  const handleZoomIn = () => setZoom((prev) => Math.min(260, prev + 25));
  const handleZoomOut = () => setZoom((prev) => Math.max(60, prev - 25));

  // Compute Phase Difference between Deck A and Deck B beats
  let phaseDiff = 0; // -1 to +1
  let isInPhase = false;
  if (deckA.isPlaying && deckB.isPlaying && deckA.bpm > 0 && deckB.bpm > 0) {
    const beatSecA = 60 / deckA.currentBpm;
    const beatSecB = 60 / deckB.currentBpm;
    const beatPhaseA = (deckA.currentTime % beatSecA) / beatSecA;
    const beatPhaseB = (deckB.currentTime % beatSecB) / beatSecB;
    let diff = beatPhaseA - beatPhaseB;
    if (diff > 0.5) diff -= 1.0;
    if (diff < -0.5) diff += 1.0;
    phaseDiff = diff * 2;
    isInPhase = Math.abs(diff) < 0.04;
  }

  return (
    <div className="relative w-full bg-[#101827] border border-[#26364A] rounded-lg p-3 flex flex-col gap-2.5 shadow-panel">
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between px-1 pb-1.5 border-b border-[#26364A] text-xs font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-[#20C8F4] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#20C8F4]" />
            DECK A: {deckA.track ? `${deckA.currentBpm.toFixed(2)} BPM` : 'EMPTY'}
          </span>
          <span className="text-[#26364A]">|</span>
          <span className="flex items-center gap-2 text-[#A855F7] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
            DECK B: {deckB.track ? `${deckB.currentBpm.toFixed(2)} BPM` : 'EMPTY'}
          </span>
        </div>

        {/* Center Beat Phase Meter */}
        <div className="flex items-center gap-2.5">
          <Activity size={14} className="text-[#73849B]" />
          <span className="text-[11px] text-[#A6B4C8] font-medium tracking-wide">PHASE</span>
          <div className="relative w-40 h-3.5 bg-[#080D16] rounded border border-[#26364A] overflow-hidden flex items-center justify-center">
            {/* Center target tick */}
            <div className={`absolute top-0 bottom-0 w-[2px] z-10 ${isInPhase ? 'bg-[#34D399]' : 'bg-[#73849B]'}`} />
            
            {/* Phase drift bar */}
            {deckA.isPlaying && deckB.isPlaying && (
              <div
                className={`absolute top-0.5 bottom-0.5 w-3 rounded-sm transition-all duration-75 ${
                  isInPhase
                    ? 'bg-[#34D399]'
                    : phaseDiff < 0
                    ? 'bg-[#20C8F4]'
                    : 'bg-[#A855F7]'
                }`}
                style={{
                  left: `calc(50% + ${phaseDiff * 45}% - 6px)`,
                }}
              />
            )}
          </div>
          {isInPhase && (
            <span className="text-[10px] font-bold text-[#34D399] px-1.5 py-0.5 rounded bg-[#34D399]/10 border border-[#34D399]/30">
              LOCKED
            </span>
          )}
        </div>

        {/* Zoom and Grid Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBeatGrid(!showBeatGrid)}
            title="Toggle Beat Grid"
            className={`p-1.5 rounded-md text-xs transition-colors border ${
              showBeatGrid 
                ? 'bg-[#141F30] text-[#20C8F4] border-[#20C8F4]/40' 
                : 'text-[#73849B] border-[#26364A] hover:text-[#F1F5F9]'
            }`}
          >
            <Grid size={14} />
          </button>
          <div className="flex items-center gap-1 bg-[#080D16] border border-[#26364A] rounded-md px-1 py-0.5">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 text-[#A6B4C8] hover:text-[#20C8F4] transition-colors"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[11px] text-[#A6B4C8] font-mono w-9 text-center tabular-nums">
              {Math.round((zoom / 130) * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 text-[#A6B4C8] hover:text-[#20C8F4] transition-colors"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Stacked Scrolling Waveforms */}
      <div className="flex flex-col gap-2">
        <ScrollingWaveform
          deck={deckA}
          colorScheme="cyan"
          zoom={zoom}
          height={76}
          onSeek={onSeekDeckA}
          onScratch={onScratchDeckA}
          showBeatGrid={showBeatGrid}
        />
        <ScrollingWaveform
          deck={deckB}
          colorScheme="violet"
          zoom={zoom}
          height={76}
          onSeek={onSeekDeckB}
          onScratch={onScratchDeckB}
          showBeatGrid={showBeatGrid}
        />
      </div>
    </div>
  );
};
