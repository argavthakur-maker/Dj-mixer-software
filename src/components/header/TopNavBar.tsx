import React, { useState, useEffect } from 'react';
import { 
  Disc, 
  Cpu, 
  Volume2,
  Settings, 
  Radio, 
  Circle, 
  Sliders, 
  Layers, 
  Minus, 
  X, 
  Square,
  HelpCircle
} from 'lucide-react';
import type { AppViewMode } from '../../types/dj';

interface TopNavBarProps {
  viewMode: AppViewMode;
  onViewModeChange: (mode: AppViewMode) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  masterVolume: number;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  viewMode,
  onViewModeChange,
  isRecording,
  onToggleRecording,
  masterVolume,
  onOpenSettings,
  onOpenHelp,
}) => {
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [cpuUsage, setCpuUsage] = useState(14);
  const [clock, setClock] = useState('');

  // Live session clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Recording duration timer
  useEffect(() => {
    let interval: number;
    if (isRecording) {
      interval = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Subtle simulated DSP CPU load modulation
  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage(12 + Math.floor(Math.random() * 8));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const formatRecordTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-12 bg-[#0A0D14] border-b border-[#1E2533] px-3 flex items-center justify-between select-none z-50">
      {/* 1. Left Brand Identity: NIGHTSHIFT Logo + Custom Glowing Disc */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Custom DJ Disc Icon with Neon Aura */}
          <div className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-glow-cyan">
            <Disc size={15} className="text-black animate-spin-slow" />
            <div className="absolute w-1.5 h-1.5 rounded-full bg-white" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-sm tracking-widest text-white">
                NIGHT<span className="text-cyan-400">SHIFT</span>
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#18202E] text-slate-400 border border-[#252E3E]">
                PRO DJ
              </span>
            </div>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center bg-[#07090E] border border-[#1A212E] rounded p-0.5 ml-3">
          <button
            onClick={() => onViewModeChange('performance')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
              viewMode === 'performance'
                ? 'bg-[#18202F] text-cyan-400 shadow-inner'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders size={11} />
            PERFORMANCE
          </button>
          <button
            onClick={() => onViewModeChange('split')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
              viewMode === 'split'
                ? 'bg-[#18202F] text-cyan-400 shadow-inner'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={11} />
            SPLIT DECK
          </button>
          <button
            onClick={() => onViewModeChange('library')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
              viewMode === 'library'
                ? 'bg-[#18202F] text-cyan-400 shadow-inner'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc size={11} />
            LIBRARY
          </button>
        </div>
      </div>

      {/* 2. Center: Master Output, Latency Status, Session Clock & Live Recording */}
      <div className="flex items-center gap-4">
        {/* Audio Output Engine Specs Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-[#090C12] border border-[#1C2332] text-[10px] font-mono">
          <Radio size={12} className="text-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-bold">48.0 kHz</span>
          <span className="text-[#323B49]">|</span>
          <span className="text-slate-400">2.1ms DSP</span>
          <span className="text-[#323B49]">|</span>
          <span className="text-cyan-400 font-bold">LOW LATENCY</span>
        </div>

        {/* Live Recording Console */}
        <button
          onClick={onToggleRecording}
          className={`flex items-center gap-2 px-3 py-1 rounded border font-mono text-[10px] font-bold uppercase transition-all duration-150 active:scale-95 ${
            isRecording
              ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-md'
              : 'bg-[#11151F] text-slate-300 border-[#222A3A] hover:border-rose-500/50 hover:text-white'
          }`}
        >
          <Circle
            size={10}
            className={`${isRecording ? 'text-rose-500 fill-rose-500 animate-ping' : 'text-rose-500 fill-rose-500'}`}
          />
          {isRecording ? (
            <span className="flex items-center gap-1 text-rose-300">
              REC {formatRecordTime(recordSeconds)}
            </span>
          ) : (
            <span>RECORD MIX</span>
          )}
        </button>

        {/* Master Volume Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#090C12] border border-[#1C2332] text-[10px] font-mono">
          <Volume2 size={12} className="text-cyan-400" />
          <span className="text-slate-400 font-bold">MST:</span>
          <span className="text-slate-200 font-bold">{Math.round(masterVolume * 100)}%</span>
        </div>

        {/* Real-time Session Clock */}
        <div className="text-[11px] font-mono font-bold text-slate-300 bg-[#0E131C] px-2 py-1 rounded border border-[#1C2332]">
          {clock}
        </div>
      </div>

      {/* 3. Right: CPU / Performance Indicator + Window Controls */}
      <div className="flex items-center gap-3">
        {/* CPU Load Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#090C12] border border-[#1C2332] text-[10px] font-mono">
          <Cpu size={12} className={cpuUsage > 50 ? 'text-amber-400' : 'text-slate-400'} />
          <span className="text-slate-400 font-bold">DSP:</span>
          <span className={cpuUsage > 50 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
            {cpuUsage}%
          </span>
        </div>

        {/* Help & Shortcuts Guide */}
        <button
          onClick={onOpenHelp}
          title="Keyboard shortcuts & Pro DJ Guide"
          className="p-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-[#141A26] transition-colors"
        >
          <HelpCircle size={15} />
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          title="Audio Hardware & Latency Settings"
          className="p-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-[#141A26] transition-colors"
        >
          <Settings size={15} />
        </button>

        <div className="h-4 w-[1px] bg-[#222A3A]" />

        {/* Window Controls (Styled like desktop pro app) */}
        <div className="flex items-center gap-1">
          <button
            title="Minimize"
            className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#1A2230] transition-colors"
          >
            <Minus size={11} />
          </button>
          <button
            title="Maximize"
            className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#1A2230] transition-colors"
          >
            <Square size={10} />
          </button>
          <button
            title="Close"
            className="w-5 h-5 rounded flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </header>
  );
};
