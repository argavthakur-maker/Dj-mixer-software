import React from 'react';
import { X, Keyboard, Zap, Disc } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm select-none">
      <div className="w-[600px] bg-[#11151E] border border-[#252E3E] rounded-lg shadow-2xl overflow-hidden flex flex-col font-mono text-xs max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0D14] border-b border-[#1F2736]">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Keyboard size={15} />
            <span className="tracking-wider">NIGHTSHIFT PRO DJ WORKFLOW & SHORTCUTS</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto text-slate-300">
          {/* Deck Shortcuts */}
          <div className="grid grid-cols-2 gap-4">
            {/* Deck A */}
            <div className="flex flex-col gap-2 bg-[#0A0D14] p-3 rounded border border-cyan-500/20">
              <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                <Disc size={13} />
                DECK A CONTROLS
              </span>
              <div className="flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-400">Play / Pause</span> <kbd className="px-1.5 py-0.5 rounded bg-[#161D2B] text-white">Spacebar</kbd></div>
                <div className="flex justify-between"><span className="text-slate-400">Cue Point</span> <kbd className="px-1.5 py-0.5 rounded bg-[#161D2B] text-white">C</kbd></div>
                <div className="flex justify-between"><span className="text-slate-400">Sync Tempo</span> <kbd className="px-1.5 py-0.5 rounded bg-[#161D2B] text-white">S</kbd></div>
                <div className="flex justify-between"><span className="text-slate-400">Hot Cues 1-8</span> <kbd className="px-1.5 py-0.5 rounded bg-[#161D2B] text-white">1 - 8</kbd></div>
                <div className="flex justify-between"><span className="text-slate-400">Nudge Pitch</span> <kbd className="px-1.5 py-0.5 rounded bg-[#161D2B] text-white">[ / ]</kbd></div>
                <div className="flex justify-between"><span className="text-slate-400">Kill Bass (Low)</span> <kbd className="px-1.5 py-0.5 rounded bg-[#161D2B] text-white">Z</kbd></div>
              </div>
            </div>

            {/* Deck B */}
            <div className="flex flex-col gap-2 bg-[#0A0D14] p-3 rounded border border-fuchsia-500/20">
              <span className="text-[11px] font-bold text-fuchsia-400 flex items-center gap-1.5">
                <Disc size={13} />
                DECK B CONTROLS
              </span>
              <div className="flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between"><span className="text-slate-400">Play / Pause</span> <kbd className="px-1.5 py-0.5 rounded bg-[#161D2B] text-white">Enter</kbd></div>
                <div className="flex justify-between"><span className="text-slate-400">Cue Point</span> <kbd className="px-1.5 py-0.5 rounded bg-[#161D2B] text-white">K</kbd></div>
                <div className="flex justify-between"><span className="text-slate-400">Sync Tempo</span> <kbd className="px-1.5 py-0.5 rounded bg-[#161D2B] text-white">B</kbd></div>
                <div className="flex justify-between"><span className="text-slate-400">Hot Cues 1-8</span> <kbd className="px-1.5 py-0.5 rounded bg-[#161D2B] text-white">Numpad 1 - 8</kbd></div>
                <div className="flex justify-between"><span className="text-slate-400">Nudge Pitch</span> <kbd className="px-1.5 py-0.5 rounded bg-[#161D2B] text-white">- / =</kbd></div>
                <div className="flex justify-between"><span className="text-slate-400">Kill Bass (Low)</span> <kbd className="px-1.5 py-0.5 rounded bg-[#161D2B] text-white">M</kbd></div>
              </div>
            </div>
          </div>

          {/* Mixing Pro Tips */}
          <div className="flex flex-col gap-2 bg-[#0A0D14] p-3 rounded border border-[#1E2533]">
            <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
              <Zap size={13} />
              DJ MIXING ESSENTIALS
            </span>
            <ul className="list-disc list-inside text-[11px] text-slate-300 flex flex-col gap-1.5">
              <li><strong className="text-white">Harmonic Mixing:</strong> Match Camelot keys (e.g. 8A with 8A, 7A, 9A, or 8B) for seamless, melodic transitions without harmonic clash.</li>
              <li><strong className="text-white">Beat Matching:</strong> Use the stacked center waveforms and phase meter to align the beat grid lines of Deck A and Deck B.</li>
              <li><strong className="text-white">Turntable Scratching:</strong> Click and drag the vinyl platter to scratch and scrub audio in real time with authentic pitch modulation.</li>
              <li><strong className="text-white">Live Mix Recording:</strong> Click "RECORD MIX" in the top bar to record your entire performance and download as an audio file.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-4 py-2.5 bg-[#0A0D14] border-t border-[#1F2736]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-500 text-black font-bold uppercase tracking-wider hover:bg-cyan-400 transition-colors"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
