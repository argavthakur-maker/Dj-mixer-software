import React from 'react';
import { X, Sliders, Cpu, Radio } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm select-none">
      <div className="w-[520px] bg-[#11151E] border border-[#252E3E] rounded-lg shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0D14] border-b border-[#1F2736]">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Sliders size={15} />
            <span className="tracking-wider">NIGHTSHIFT AUDIO & HARDWARE PREFERENCES</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4 text-slate-300">
          {/* Audio Engine */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Radio size={12} className="text-cyan-400" />
              Audio Output Engine
            </span>
            <div className="grid grid-cols-2 gap-3 bg-[#0A0D14] p-3 rounded border border-[#1E2533]">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400">Sample Rate</label>
                <select className="bg-[#131824] border border-[#232C3B] rounded p-1 text-slate-200">
                  <option>48,000 Hz (Club Standard)</option>
                  <option>44,100 Hz (CD Audio)</option>
                  <option>96,000 Hz (High Resolution)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400">Buffer Size (Latency)</label>
                <select className="bg-[#131824] border border-[#232C3B] rounded p-1 text-slate-200">
                  <option>128 Samples (2.1 ms) - Low Latency</option>
                  <option>256 Samples (4.2 ms) - Balanced</option>
                  <option>512 Samples (8.4 ms) - Safe</option>
                </select>
              </div>
            </div>
          </div>

          {/* Deck & Turntable */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu size={12} className="text-violet-400" />
              Platter & Scratch Behavior
            </span>
            <div className="grid grid-cols-2 gap-3 bg-[#0A0D14] p-3 rounded border border-[#1E2533]">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400">Turntable Speed</label>
                <select className="bg-[#131824] border border-[#232C3B] rounded p-1 text-slate-200">
                  <option>33 ⅓ RPM (Vinyl Standard)</option>
                  <option>45 RPM (Single Cut)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-400">Crossfader Cut Lag</label>
                <select className="bg-[#131824] border border-[#232C3B] rounded p-1 text-slate-200">
                  <option>1.0 mm (Fast Cut / Scratch)</option>
                  <option>2.0 mm (Club Standard)</option>
                  <option>3.5 mm (Smooth Blend)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Master Output Limiter */}
          <div className="flex items-center justify-between bg-[#0A0D14] p-3 rounded border border-[#1E2533]">
            <div className="flex flex-col">
              <span className="font-bold text-white">Peak Limiter & Headroom</span>
              <span className="text-[10px] text-slate-400">Prevent digital clipping on club sound systems</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              ACTIVE (-0.5 dB)
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-4 py-2.5 bg-[#0A0D14] border-t border-[#1F2736]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-500 text-black font-bold uppercase tracking-wider hover:bg-cyan-400 transition-colors"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
