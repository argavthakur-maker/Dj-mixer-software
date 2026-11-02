import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { DeckState } from '../../types/dj';
import { TrackArtwork } from '../common/TrackArtwork';

interface JogWheelProps {
  deck: DeckState;
  colorScheme: 'cyan' | 'violet';
  size?: number;
  onScratch: (delta: number) => void;
  onSeek: (newTime: number) => void;
  onNudge: (amount: number) => void;
}

const ACCENT = {
  cyan: { primary: '#00E5FF', bright: '#38F6FF', glow: 'rgba(0,229,255,0.5)' },
  violet: { primary: '#8B5CF6', bright: '#A78BFA', glow: 'rgba(139,92,246,0.5)' },
} as const;

export const JogWheel: React.FC<JogWheelProps> = ({
  deck,
  colorScheme,
  size = 208,
  onScratch,
  onSeek,
  onNudge,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef(0);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [displayAngle, setDisplayAngle] = useState(0);
  const lastAngleRef = useRef(0);
  const velocityRef = useRef(0); // deg/s during grab, for smooth release
  const lastMoveTimeRef = useRef(0);

  const colors = ACCENT[colorScheme];
  const isPlaying = deck.isPlaying;

  // Continuous rotation during playback + momentum decay after release
  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
      lastTimestamp = timestamp;

      if (isGrabbing) {
        // Rotation handled directly by pointer deltas
      } else if (isPlaying && deck.bpm > 0) {
        const speedMultiplier = deck.currentBpm / deck.bpm;
        const degPerSec = (360 / 1.8) * speedMultiplier;
        rotationRef.current = (rotationRef.current + degPerSec * dt) % 360;
        setDisplayAngle(rotationRef.current);
      } else if (Math.abs(velocityRef.current) > 5) {
        // Gentle platter deceleration after release
        velocityRef.current *= Math.pow(0.02, dt);
        rotationRef.current = (rotationRef.current + velocityRef.current * dt) % 360;
        setDisplayAngle(rotationRef.current);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isGrabbing, deck.bpm, deck.currentBpm]);

  const getAngle = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - centerY, clientX - centerX);
    return rad * (180 / Math.PI);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!deck.track) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setIsGrabbing(true);
    velocityRef.current = 0;
    lastAngleRef.current = getAngle(e.clientX, e.clientY);
    lastMoveTimeRef.current = performance.now();
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isGrabbing || !deck.track) return;
      const currentAngle = getAngle(e.clientX, e.clientY);
      let deltaAngle = currentAngle - lastAngleRef.current;

      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;

      lastAngleRef.current = currentAngle;
      const now = performance.now();
      const dt = Math.max((now - lastMoveTimeRef.current) / 1000, 0.001);
      lastMoveTimeRef.current = now;
      velocityRef.current = deltaAngle / dt;

      rotationRef.current = (rotationRef.current + deltaAngle) % 360;
      setDisplayAngle(rotationRef.current);

      onScratch(deltaAngle);

      // Scrub: rotate the record -> move the playhead
      const secondsMoved = (deltaAngle / 360) * 1.8;
      const newTime = Math.max(0, Math.min(deck.currentTime + secondsMoved, deck.track.duration));
      onSeek(newTime);
    };

    const handlePointerUp = () => {
      if (isGrabbing) setIsGrabbing(false);
    };

    if (isGrabbing) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isGrabbing, deck.track, deck.currentTime, getAngle, onScratch, onSeek]);

  const beatProgress = deck.bpm > 0
    ? (deck.currentTime % (60 / deck.currentBpm)) / (60 / deck.currentBpm)
    : 0;

  return (
    <div className="flex flex-col items-center select-none">
      {/* Platter assembly */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        role="slider"
        aria-label={`Deck ${deck.id} platter — drag to scrub`}
        aria-valuenow={Math.round(deck.currentTime * 10) / 10}
        aria-valuemin={0}
        aria-valuemax={deck.track ? Math.round(deck.track.duration * 10) / 10 : 0}
        tabIndex={0}
        title="Click and drag the platter to scrub the track"
        style={{ width: size, height: size }}
        className={`relative rounded-full cursor-grab active:cursor-grabbing outline-none transition-shadow ${
          isGrabbing ? 'ring-1 ring-offset-0' : ''
        }`}
      >
        {/* Ambient deck glow behind the platter */}
        <div
          className="absolute -inset-3 rounded-full pointer-events-none transition-opacity duration-500"
          style={{
            background: isPlaying
              ? `radial-gradient(circle, ${colors.glow} 0%, transparent 65%)`
              : 'transparent',
            opacity: isPlaying ? 0.55 : 0.18,
          }}
        />

        {/* Metallic outer rim */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(from 140deg, #3A4454 0%, #1D2531 20%, #2C3644 38%, #181F29 55%, #343E4E 74%, #1D2531 92%, #3A4454 100%)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.12), 0 4px 14px rgba(0,0,0,0.65)',
          }}
        />

        {/* Strobe tick ring on the rim */}
        <div
          className={`absolute inset-[3px] rounded-full pointer-events-none opacity-40 ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="absolute inset-0" style={{ transform: `rotate(${i * 15}deg)` }}>
              <div
                className={`absolute top-px left-1/2 -translate-x-1/2 w-0.5 h-1 ${
                  i % 6 === 0 ? 'bg-white/30' : 'bg-white/10'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Rotating vinyl platter */}
        <div
          className="absolute inset-[10px] rounded-full vinyl-grooves overflow-hidden"
          style={{
            transform: `rotate(${displayAngle}deg)`,
            boxShadow: 'inset 0 0 22px rgba(0,0,0,0.75), inset 0 0 4px rgba(0,0,0,0.9)',
          }}
        >
          {/* Radial sheen sweep */}
          <div className="absolute inset-0 vinyl-sheen pointer-events-none" />

          {/* Tonearm position marker */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[3px] pointer-events-none"
            style={{
              background: `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primary}22 100%)`,
            }}
          />

          {/* Dead-wax ring text effect (offset circles) */}
          <div
            className="absolute rounded-full pointer-events-none border border-white/5"
            style={{ inset: '22%' }}
          />
        </div>

        {/* Center label: artwork or placeholder */}
        <div
          className="absolute rounded-full overflow-hidden bg-[#111722] border border-[#000]/60"
          style={{
            inset: size * 0.27,
            transform: `rotate(${displayAngle}deg)`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.7)',
          }}
        >
          {deck.track ? (
            <div className="w-full h-full">
              <TrackArtwork track={deck.track} size={size * 0.46} className="rounded-full" />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#131A26]">
              <span
                className="text-[10px] font-mono font-bold tracking-[0.2em]"
                style={{ color: colors.primary }}
              >
                NS
              </span>
              <span className="text-[7px] font-mono text-[#5A6678] tracking-[0.15em] mt-0.5">EMPTY</span>
            </div>
          )}

          {/* Vinyl label ring */}
          <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
          {/* Spindle */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#07090D] border border-[#2A3342]"
            style={{ width: Math.max(8, size * 0.05), height: Math.max(8, size * 0.05) }}
          />
        </div>

        {/* Beat LED orbiting the platter */}
        <div
          className="absolute inset-[-2px] rounded-full pointer-events-none"
          style={{ transform: `rotate(${beatProgress * 360}deg)` }}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{
              top: -2,
              width: 7,
              height: 7,
              backgroundColor: isGrabbing ? '#FFBF47' : colors.bright,
              boxShadow: `0 0 8px 1px ${
                isGrabbing ? 'rgba(255,191,71,0.9)' : colors.glow
              }`,
            }}
          />
        </div>

        {/* Playback state arc (subtle, full ring at PLAY) */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isPlaying ? 1 : 0,
            border: `1.5px solid ${colors.primary}66`,
            boxShadow: `0 0 10px -2px ${colors.glow}`,
          }}
        />
      </div>

      {/* Nudge buttons + platter state */}
      <div className="flex items-center gap-2 mt-3 w-full justify-center">
        <button
          onClick={() => onNudge(-0.02)}
          title="Pitch bend down (nudge back)"
          className="px-3 py-1 rounded-[3px] bg-[#111722] hover:bg-[#161D29] text-[#A7B1C2] hover:text-[#F4F7FC] border border-[#252D3A] text-[10px] font-mono font-semibold tracking-wide transition-colors active:scale-95"
        >
          ◄ BEND
        </button>

        <span
          className={`text-[9px] font-mono tracking-[0.2em] font-bold px-2 py-0.5 rounded-[3px] bg-[#0A0E14] border transition-colors ${
            isGrabbing
              ? 'text-[#FFBF47] border-[#FFBF47]/50'
              : deck.vinylMode
              ? ''
              : 'text-[#5A6678] border-[#252D3A]'
          }`}
          style={
            !isGrabbing && deck.vinylMode
              ? { color: colors.primary, borderColor: `${colors.primary}55` }
              : undefined
          }
        >
          {isGrabbing ? 'SCRUB' : deck.vinylMode ? 'VINYL' : 'CDJ'}
        </span>

        <button
          onClick={() => onNudge(0.02)}
          title="Pitch bend up (nudge forward)"
          className="px-3 py-1 rounded-[3px] bg-[#111722] hover:bg-[#161D29] text-[#A7B1C2] hover:text-[#F4F7FC] border border-[#252D3A] text-[10px] font-mono font-semibold tracking-wide transition-colors active:scale-95"
        >
          BEND ►
        </button>
      </div>
    </div>
  );
};
