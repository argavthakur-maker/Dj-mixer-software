import React, { useState, useEffect } from 'react';
import {
  Disc,
  Settings,
  Volume2,
  Sliders,
  Layers,
  PanelBottomClose,
  PanelBottomOpen,
  Keyboard,
  ArrowRightLeft,
} from 'lucide-react';
import type { AppViewMode, DeckState } from '../../types/dj';
import { VuMeter } from '../common/VuMeter';

interface TopNavBarProps {
  viewMode: AppViewMode;
  onViewModeChange: (mode: AppViewMode) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  deckA: DeckState;
  deckB: DeckState;
  masterMeterL: number;
  masterMeterR: number;
  libraryCollapsed: boolean;
  onToggleLibrary: () => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  viewMode,
  onViewModeChange,
  isRecording,
  onToggleRecording,
  deckA,
  deckB,
  masterMeterL,
  masterMeterR,
  libraryCollapsed,
  onToggleLibrary,
  onOpenSettings,
  onOpenHelp,
}) => {
  const [recordSeconds, setRecordSeconds] = useState(0);

  // Live recording duration timer
  useEffect(() => {
    if (!isRecording) {
      setRecordSeconds(0);
      return;
    }
    const interval = window.setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Master clock: the deck flagged as MASTER; BPM in sync when running rates match
  const masterDeck = deckA.isMaster ? deckA : deckB;
  const bothPlaying = deckA.isPlaying && deckB.isPlaying;
  const bpmInSync =
    bothPlaying && Math.abs(deckA.currentBpm - deckB.currentBpm) < 0.05;

  const formatRecordTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navItems: Array<{ mode: AppViewMode; label: string; icon: React.ReactNode }> = [
    { mode: 'performance', label: 'Performance', icon: <Sliders size={13} /> },
    { mode: 'split', label: 'Split Deck', icon: <Layers size={13} /> },
    { mode: 'library', label: 'Library', icon: <Disc size={13} /> },
  ];

  return (
    <header className="h-11 shrink-0 bg-[#0D1118]/95 border-b border-[#252D3A] px-3 flex items-center justify-between select-none z-20">
      {/* Left: brand + mode navigation */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 shrink-0">
          {/* Vinyl mark */}
          <div className="w-7 h-7 rounded-full bg-[#111722] border border-[#252D3A] flex items-center justify-center">
            <div className="w-[18px] h-[18px] rounded-full vinyl-grooves relative">
              <div className="absolute inset-[3px] rounded-full bg-gradient-to-tr from-[#00E5FF] to-[#8B5CF6]" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans font-bold text-[15px] tracking-[0.14em] text-[#F4F7FC] leading-none">
              NIGHT<span className="text-[#00E5FF]">SHIFT</span>
            </span>
            <span className="text-[8px] font-mono font-bold tracking-[0.2em] text-[#8490A3] border border-[#252D3A] rounded px-1 py-px bg-[#111722]">
              PRO
            </span>
          </div>
        </div>

        {/* Mode selector */}
        <nav className="flex items-center gap-0.5 bg-[#0A0E14] border border-[#252D3A] rounded p-0.5">
          {navItems.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              aria-pressed={viewMode === mode}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] font-medium tracking-wide transition-colors ${
                viewMode === mode
                  ? 'bg-[#161D29] text-[#00E5FF] shadow-inset'
                  : 'text-[#A7B1C2] hover:text-[#F4F7FC]'
              }`}
            >
              {icon}
              <span className="hidden 2xl:inline">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Center: session status */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Master BPM readout */}
        <div className="flex items-baseline gap-2 px-3 py-1 bg-[#0A0E14] border border-[#252D3A] rounded">
          <span className="text-[9px] font-mono font-semibold tracking-[0.18em] text-[#8490A3]">MASTER</span>
          <span className="font-sans font-bold text-[15px] text-[#00E5FF] tabular-nums leading-none">
            {masterDeck.track ? masterDeck.currentBpm.toFixed(1) : '---.-'}
          </span>
          <span className="text-[9px] font-mono text-[#8490A3] leading-none">BPM</span>
        </div>

        {/* Sync status */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono font-bold tracking-[0.15em] transition-colors ${
            bpmInSync
              ? 'bg-[#0E221A] text-[#37F59A] border-[#37F59A]/40'
              : 'bg-[#0A0E14] text-[#5A6678] border-[#252D3A]'
          }`}
          title={
            bpmInSync
              ? 'Both decks are beat-matched'
              : 'Both decks must be playing for phase detection'
          }
        >
          <ArrowRightLeft size={11} className={bpmInSync ? 'text-[#37F59A]' : 'text-[#5A6678]'} />
          {bpmInSync ? 'BEATS LOCKED' : 'BPM FREE'}
        </div>

        {/* Master output meter */}
        <div className="hidden xl:flex items-center gap-2 px-2 py-0.5 bg-[#0A0E14] border border-[#252D3A] rounded">
          <Volume2 size={12} className="text-[#8490A3]" />
          <VuMeter level={masterMeterL} height={18} width={5} segments={7} />
          <VuMeter level={masterMeterR} height={18} width={5} segments={7} />
        </div>
      </div>

      {/* Right: recording + system */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenHelp}
          title="Keyboard shortcuts & DJ guide"
          aria-label="Open help"
          className="p-1.5 rounded text-[#A7B1C2] hover:text-[#F4F7FC] hover:bg-[#161D29] transition-colors"
        >
          <Keyboard size={15} />
        </button>

        <button
          onClick={onToggleLibrary}
          title={libraryCollapsed ? 'Expand music library (L)' : 'Collapse music library (L)'}
          aria-label={libraryCollapsed ? 'Expand music library' : 'Collapse music library'}
          className="p-1.5 rounded text-[#A7B1C2] hover:text-[#00E5FF] hover:bg-[#161D29] transition-colors"
        >
          {libraryCollapsed ? <PanelBottomOpen size={15} /> : <PanelBottomClose size={15} />}
        </button>

        {/* Recording control */}
        <button
          onClick={onToggleRecording}
          title={isRecording ? 'Stop recording and download the mix' : 'Start recording the live mix'}
          aria-pressed={isRecording}
          className={`flex items-center gap-2 px-3 py-1.5 rounded border text-[11px] font-mono font-bold tracking-[0.1em] transition-colors ${
            isRecording
              ? 'bg-[#2A0E15] text-[#FF3B57] border-[#FF3B57]/60 shadow-glow-rec'
              : 'bg-[#111722] text-[#FF3B57] border-[#252D3A] hover:border-[#FF3B57]/50'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full bg-[#FF3B57] ${
              isRecording ? 'animate-pulse-rec' : ''
            }`}
            aria-hidden
          />
          {isRecording ? `REC ${formatRecordTime(recordSeconds)}` : 'REC'}
        </button>

        <button
          onClick={onOpenSettings}
          title="Preferences"
          aria-label="Open settings"
          className="p-1.5 rounded text-[#A7B1C2] hover:text-[#F4F7FC] hover:bg-[#161D29] transition-colors"
        >
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
};
