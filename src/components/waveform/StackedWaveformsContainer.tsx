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
    phaseDiff = diff * 2; // scale to [-1, 1]
    isInPhase = Math.abs(diff) < 0.04;
  }

  return (
    <div className="relative w-full bg-[#0D1017] border border-[#252B36] rounded-md p-2 flex flex-col gap-1.5 shadow-2xl">
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between px-2 py-0.5 border-b border-[#1A212E] text-[11px] font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-glow-cyan animate-pulse" />
            DECK A: {deckA.track ? `${deckA.currentBpm.toFixed(2)} BPM` : 'EMPTY'}
          </span>
          <span className="text-[#323B49]">|</span>
          <span className="flex items-center gap-1.5 text-fuchsia-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-glow-magenta animate-pulse" />
            DECK B: {deckB.track ? `${deckB.currentBpm.toFixed(2)} BPM` : 'EMPTY'}
          </span>
        </div>

        {/* Center Beat Phase Meter (Pioneer CDJ / Serato Beat Phase Indicator) */}
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-slate-500" />
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">BEAT PHASE</span>
          <div className="relative w-36 h-3 bg-[#080A0F] rounded border border-[#252B36] overflow-hidden flex items-center justify-center">
            {/* Center target tick */}
            <div className={`absolute top-0 bottom-0 w-[2px] z-10 ${isInPhase ? 'bg-emerald-400 shadow-glow-emerald' : 'bg-slate-500'}`} />
            
            {/* Phase drift bar */}
            {deckA.isPlaying && deckB.isPlaying && (
              <div
                className={`absolute top-0.5 bottom-0.5 w-3 rounded-sm transition-all duration-75 ${
                  isInPhase
                    ? 'bg-emerald-400 shadow-glow-emerald'
                    : phaseDiff < 0
                    ? 'bg-cyan-400'
                    : 'bg-fuchsia-400'
                }`}
                style={{
                  left: `calc(50% + ${phaseDiff * 45}% - 6px)`,
                }}
              />
            )}
          </div>
          {isInPhase && (
            <span className="text-[9px] font-bold text-emerald-400 px-1 rounded bg-emerald-950/60 border border-emerald-500/30">
              LOCKED
            </span>
          )}
        </div>

        {/* Zoom and Grid Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowBeatGrid(!showBeatGrid)}
            title="Toggle Beat Grid"
            className={`p-1 rounded text-xs transition-colors ${
              showBeatGrid ? 'bg-cyan-950/70 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Grid size={13} />
          </button>
          <div className="flex items-center gap-0.5 bg-[#090B10] border border-[#252B36] rounded px-1">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ZoomOut size={13} />
            </button>
            <span className="text-[10px] text-slate-400 font-mono w-7 text-center">{Math.round((zoom / 130) * 100)}%</span>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Stacked Scrolling Waveforms */}
      <div className="flex flex-col gap-1.5">
        <ScrollingWaveform
          deck={deckA}
          colorScheme="cyan"
          zoom={zoom}
          height={78}
          onSeek={onSeekDeckA}
          onScratch={onScratchDeckA}
          showBeatGrid={showBeatGrid}
        />
        <ScrollingWaveform
          deck={deckB}
          colorScheme="violet"
          zoom={zoom}
          height={78}
          onSeek={onSeekDeckB}
          onScratch={onScratchDeckB}
          showBeatGrid={showBeatGrid}
        />
      </div>
    </div>
  );
};

