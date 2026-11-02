import React from 'react';
import type { Track } from '../../types/dj';
import { Disc, Music } from 'lucide-react';

interface TrackArtworkProps {
  track: Track | null;
  size?: number; // size in pixels, e.g. 40, 44, 48, 56
  className?: string;
}

export const TrackArtwork: React.FC<TrackArtworkProps> = ({
  track,
  size = 44,
  className = '',
}) => {
  if (!track) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`rounded-md bg-[#141F30] border border-[#26364A] flex items-center justify-center text-[#73849B] shrink-0 ${className}`}
      >
        <Disc size={Math.round(size * 0.45)} />
      </div>
    );
  }

  const artwork = track.artworkUrl;
  const isImage = artwork && (artwork.startsWith('http') || artwork.startsWith('data:image/') || artwork.startsWith('/'));

  if (isImage) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative rounded-md overflow-hidden border border-[#26364A] shrink-0 bg-[#141F30] ${className}`}
      >
        <img
          src={artwork}
          alt={track.title}
          className="w-full h-full object-cover select-none pointer-events-none"
          loading="lazy"
        />
      </div>
    );
  }

  // Stylish SVG / Gradient Album Art Thumbnail
  return (
    <div
      style={{
        width: size,
        height: size,
        background: artwork || 'linear-gradient(135deg, #141F30 0%, #080D16 100%)',
      }}
      className={`relative rounded-md overflow-hidden border border-[#26364A] flex flex-col items-center justify-center shrink-0 shadow-sm ${className}`}
    >
      {/* Vinyl record silhouette overlay */}
      <div className="absolute inset-1 rounded-full border border-white/10 pointer-events-none flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-black/40 border border-white/20" />
      </div>
      <Music size={Math.round(size * 0.4)} className="text-white/80 z-10 drop-shadow" />
    </div>
  );
};

