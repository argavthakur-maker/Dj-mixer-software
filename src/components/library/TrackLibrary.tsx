import React, { useState, useMemo } from 'react';
import type { Track } from '../../types/dj';
import { 
  Search, 
  Folder, 
  Upload, 
  Disc, 
  Sparkles, 
  ArrowLeftCircle, 
  ArrowRightCircle
} from 'lucide-react';

interface TrackLibraryProps {
  tracks: Track[];
  deckATrackId: string | null;
  deckBTrackId: string | null;
  onLoadTrackA: (track: Track) => void;
  onLoadTrackB: (track: Track) => void;
  onImportFile: (file: File) => void;
  activeCamelotKey?: string; // from playing deck to highlight harmonic matches
}

export const TrackLibrary: React.FC<TrackLibraryProps> = ({
  tracks,
  deckATrackId,
  deckBTrackId,
  onLoadTrackA,
  onLoadTrackB,
  onImportFile,
  activeCamelotKey,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrate, setSelectedCrate] = useState('all');
  const [bpmFilter, setBpmFilter] = useState<'all' | 'house' | 'techno' | 'dnb'>('all');
  const [harmonicOnly, setHarmonicOnly] = useState(false);

  const crates = [
    { id: 'all', name: 'All Tracks', count: tracks.length },
    { id: 'tech-house', name: 'Tech House', count: tracks.filter(t => t.genre.includes('House')).length },
    { id: 'techno', name: 'Acid Techno Vault', count: tracks.filter(t => t.genre.includes('Techno')).length },
    { id: 'melodic', name: 'Melodic & Progressive', count: tracks.filter(t => t.genre.includes('Melodic')).length },
    { id: 'dnb', name: 'Drum & Bass 174', count: tracks.filter(t => t.genre.includes('Drum')).length },
    { id: 'synthwave', name: 'Cyberpunk Synth', count: tracks.filter(t => t.genre.includes('Synth')).length },
    { id: 'imported', name: 'User Imports', count: tracks.filter(t => t.isCustom).length },
    { id: 'prepare', name: 'Prepare Queue', count: 0 },
  ];

  // Harmonic compatibility checker (Camelot wheel rules)
  const isHarmonicMatch = (targetKey: string, sourceKey?: string) => {
    if (!sourceKey) return false;
    const match = sourceKey.match(/(\d+)([AB])/);
    const targetMatch = targetKey.match(/(\d+)([AB])/);
    if (!match || !targetMatch) return false;

    const sourceNum = parseInt(match[1]);
    const sourceLetter = match[2];
    const targetNum = parseInt(targetMatch[1]);
    const targetLetter = targetMatch[2];

    // Same key
    if (sourceNum === targetNum && sourceLetter === targetLetter) return true;
    // Relative major/minor (same number, different letter)
    if (sourceNum === targetNum && sourceLetter !== targetLetter) return true;
    // Adjacent keys on wheel (+1 or -1 on circle of 12)
    const prevNum = sourceNum === 1 ? 12 : sourceNum - 1;
    const nextNum = sourceNum === 12 ? 1 : sourceNum + 1;
    if ((targetNum === prevNum || targetNum === nextNum) && sourceLetter === targetLetter) return true;

    return false;
  };

  const filteredTracks = useMemo(() => {
    return tracks.filter((t) => {
      // Search text
      const matchesSearch = 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.key.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // Crate filter
      if (selectedCrate === 'tech-house' && !t.genre.includes('House')) return false;
      if (selectedCrate === 'techno' && !t.genre.includes('Techno')) return false;
      if (selectedCrate === 'melodic' && !t.genre.includes('Melodic')) return false;
      if (selectedCrate === 'dnb' && !t.genre.includes('Drum')) return false;
      if (selectedCrate === 'synthwave' && !t.genre.includes('Synth')) return false;
      if (selectedCrate === 'imported' && !t.isCustom) return false;

      // BPM filter
      if (bpmFilter === 'house' && (t.bpm < 122 || t.bpm > 128)) return false;
      if (bpmFilter === 'techno' && (t.bpm < 130 || t.bpm > 140)) return false;
      if (bpmFilter === 'dnb' && t.bpm < 170) return false;

      // Harmonic mixing filter
      if (harmonicOnly && activeCamelotKey && !isHarmonicMatch(t.key, activeCamelotKey)) {
        return false;
      }

      return true;
    });
  }, [tracks, searchQuery, selectedCrate, bpmFilter, harmonicOnly, activeCamelotKey]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        onImportFile(e.target.files[i]);
      }
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  const getCamelotColor = (key: string) => {
    const num = parseInt(key) || 8;
    const colors = [
      '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4', '#00E5FF',
      '#3B82F6', '#8B5CF6', '#A855F7', '#EC4899', '#F43F5E', '#84CC16'
    ];
    return colors[(num - 1) % colors.length];
  };

  return (
    <div className="flex flex-1 w-full bg-[#0D1017] border-t border-[#1F2633] overflow-hidden select-none">
      {/* 1. Left Crates & Playlists Sidebar */}
      <div className="w-56 bg-[#090C12] border-r border-[#1C2330] flex flex-col p-2 gap-1 shrink-0">
        <div className="flex items-center justify-between px-2 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
          <span>CRATES & PLAYLISTS</span>
          <Folder size={12} />
        </div>

        {/* Crates List */}
        <div className="flex flex-col gap-0.5 overflow-y-auto flex-1">
          {crates.map((crate) => (
            <button
              key={crate.id}
              onClick={() => setSelectedCrate(crate.id)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono transition-colors text-left ${
                selectedCrate === crate.id
                  ? 'bg-cyan-950/70 text-cyan-400 font-bold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#121622]'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Folder size={13} className={selectedCrate === crate.id ? 'text-cyan-400' : 'text-slate-500'} />
                <span className="truncate">{crate.name}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {crate.count}
              </span>
            </button>
          ))}
        </div>

        {/* Import Audio File Button */}
        <label className="flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#131924] hover:bg-[#1B2332] text-cyan-400 border border-cyan-500/30 font-mono text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-sm mt-1">
          <Upload size={13} />
          <span>IMPORT AUDIO</span>
          <input
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* 2. Main Track Browser Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="flex items-center justify-between p-2 gap-3 bg-[#0A0D14] border-b border-[#1C2330]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by Title, Artist, BPM, or Key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111622] text-slate-200 placeholder-slate-500 text-xs font-mono rounded pl-8 pr-3 py-1.5 border border-[#222B3B] focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Harmonic Match Quick Filter */}
          <div className="flex items-center gap-2">
            {activeCamelotKey && (
              <button
                onClick={() => setHarmonicOnly(!harmonicOnly)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold transition-all border ${
                  harmonicOnly
                    ? 'bg-purple-950/80 text-purple-300 border-purple-500 shadow-glow-violet'
                    : 'bg-[#111622] text-slate-400 border-[#222B3B] hover:text-white'
                }`}
              >
                <Sparkles size={12} className={harmonicOnly ? 'text-purple-400' : 'text-slate-500'} />
                <span>HARMONIC MATCH ({activeCamelotKey})</span>
              </button>
            )}

            {/* Quick BPM Range Filters */}
            <div className="flex items-center gap-1 bg-[#111622] border border-[#222B3B] rounded p-0.5 text-[10px] font-mono">
              {(['all', 'house', 'techno', 'dnb'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setBpmFilter(mode)}
                  className={`px-2 py-0.5 rounded uppercase font-bold transition-colors ${
                    bpmFilter === mode
                      ? 'bg-cyan-500 text-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode === 'all' ? 'ANY BPM' : mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tracks Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs font-mono">
            <thead>
              <tr className="sticky top-0 bg-[#0E121B] text-slate-400 border-b border-[#1F2736] text-[10px] uppercase font-bold z-10">
                <th className="py-2 px-3 w-12 text-center">DECK</th>
                <th className="py-2 px-3">TITLE / ARTIST</th>
                <th className="py-2 px-3 w-20 text-center">BPM</th>
                <th className="py-2 px-3 w-16 text-center">KEY</th>
                <th className="py-2 px-3 w-16 text-center">TIME</th>
                <th className="py-2 px-3 w-28">WAVEFORM</th>
                <th className="py-2 px-3 w-20 text-center">ENERGY</th>
                <th className="py-2 px-3 w-28 text-center">LOAD TO DECK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#171D28]">
              {filteredTracks.map((track) => {
                const isDeckA = deckATrackId === track.id;
                const isDeckB = deckBTrackId === track.id;
                const isHarmonic = activeCamelotKey && isHarmonicMatch(track.key, activeCamelotKey);

                return (
                  <tr
                    key={track.id}
                    className={`hover:bg-[#131824] transition-colors group ${
                      isDeckA ? 'bg-cyan-950/20' : isDeckB ? 'bg-fuchsia-950/20' : ''
                    }`}
                  >
                    {/* Deck Status Badge */}
                    <td className="py-2 px-3 text-center">
                      {isDeckA ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/40">
                          A
                        </span>
                      ) : isDeckB ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-500/40">
                          B
                        </span>
                      ) : (
                        <Disc size={13} className="mx-auto text-slate-600 group-hover:text-slate-400" />
                      )}
                    </td>

                    {/* Track Title, Artist, Album */}
                    <td className="py-2 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {track.title}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {track.artist} {track.genre ? `• ${track.genre}` : ''}
                        </span>
                      </div>
                    </td>

                    {/* BPM */}
                    <td className="py-2 px-3 text-center font-bold text-slate-200">
                      {track.bpm.toFixed(1)}
                    </td>

                    {/* Key with Camelot Color */}
                    <td className="py-2 px-3 text-center">
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-extrabold text-black inline-block shadow-sm"
                        style={{ backgroundColor: getCamelotColor(track.key) }}
                      >
                        {track.key}
                      </span>
                      {isHarmonic && (
                        <span className="block text-[8px] text-purple-400 font-bold mt-0.5">MATCH</span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-2 px-3 text-center text-slate-400">
                      {formatDuration(track.duration)}
                    </td>

                    {/* Mini Waveform preview */}
                    <td className="py-2 px-3">
                      <div className="w-24 h-4 bg-[#090C12] rounded flex items-center px-1 gap-[1px] overflow-hidden border border-[#1A2230]">
                        {track.waveformData ? (
                          Array.from({ length: 24 }).map((_, idx) => {
                            const dataIdx = Math.floor((idx / 24) * track.waveformData!.length);
                            const val = track.waveformData![dataIdx] || 0.2;
                            return (
                              <div
                                key={idx}
                                className="flex-1 bg-cyan-500/80 rounded-[0.5px]"
                                style={{ height: `${Math.max(2, Math.round(val * 14))}px` }}
                              />
                            );
                          })
                        ) : (
                          <div className="w-full text-[8px] text-slate-600 text-center">AUDIO</div>
                        )}
                      </div>
                    </td>

                    {/* Energy Level */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-3 rounded-[1px] ${
                              i < (track.energyLevel || 4)
                                ? 'bg-amber-400 shadow-glow-amber'
                                : 'bg-[#1C2330]'
                            }`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Load Deck Buttons */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onLoadTrackA(track)}
                          title="Load track to Deck A"
                          className="px-2 py-1 rounded text-[10px] font-bold bg-[#14202C] hover:bg-cyan-950 text-cyan-400 border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center gap-1"
                        >
                          <ArrowLeftCircle size={11} />
                          <span>DECK A</span>
                        </button>
                        <button
                          onClick={() => onLoadTrackB(track)}
                          title="Load track to Deck B"
                          className="px-2 py-1 rounded text-[10px] font-bold bg-[#241728] hover:bg-fuchsia-950 text-fuchsia-400 border border-fuchsia-500/40 hover:border-fuchsia-400 transition-all flex items-center gap-1"
                        >
                          <span>DECK B</span>
                          <ArrowRightCircle size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
