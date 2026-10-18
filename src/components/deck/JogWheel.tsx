import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { DeckState } from '../../types/dj';
import { Disc } from 'lucide-react';

interface JogWheelProps {
  deck: DeckState;
  colorScheme: 'cyan' | 'violet';
  size?: number;
  onScratch: (delta: number) => void;
  onSeek: (newTime: number) => void;
  onNudge: (amount: number) => void;
}

export const JogWheel: React.FC<JogWheelProps> = ({
  deck,
  colorScheme,
  size = 210,
  onScratch,
  onSeek,
  onNudge,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const lastAngleRef = useRef(0);
  const [rotationAngle, setRotationAngle] = useState(0);

  const primaryColor = colorScheme === 'cyan' ? '#00E5FF' : '#D946EF';
  const glowShadow = colorScheme === 'cyan' ? 'rgba(0, 229, 255, 0.4)' : 'rgba(217, 70, 239, 0.4)';
  const activeBorder = colorScheme === 'cyan' ? 'border-cyan-400' : 'border-fuchsia-400';

  // Continuous rotation during normal playback
  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();

    const loop = (timestamp: number) => {
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (deck.isPlaying && !isGrabbing && deck.bpm > 0) {
        // 33.3 RPM = 360 degrees in 1.8 seconds * pitch rate
        const speedMultiplier = deck.currentBpm / deck.bpm;
        const degPerSec = (360 / 1.8) * speedMultiplier;
        setRotationAngle((prev) => (prev + degPerSec * dt) % 360);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [deck.isPlaying, deck.bpm, deck.currentBpm, isGrabbing]);

  // Calculate mouse angle relative to jog wheel center
  const getAngle = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rad = Math.atan2(clientY - centerY, clientX - centerX);
    return rad * (180 / Math.PI);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsGrabbing(true);
    const startAngle = getAngle(e.clientX, e.clientY);
    lastAngleRef.current = startAngle;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isGrabbing || !deck.track) return;
      const currentAngle = getAngle(e.clientX, e.clientY);
      let deltaAngle = currentAngle - lastAngleRef.current;

      // Handle angle wrap-around at 180 / -180
      if (deltaAngle > 180) deltaAngle -= 360;
      if (deltaAngle < -180) deltaAngle += 360;

      lastAngleRef.current = currentAngle;

      // Update visual platter angle
      setRotationAngle((prev) => (prev + deltaAngle) % 360);

      // Trigger scratch audio pitch modulation
      onScratch(deltaAngle);

      // Scrub time: 360 degrees = 1.8 seconds of track audio
      const secondsMoved = (deltaAngle / 360) * 1.8;
      const newTime = Math.max(0, Math.min(deck.currentTime + secondsMoved, deck.track.duration));
      onSeek(newTime);
    };

    const handleMouseUp = () => {
      if (isGrabbing) {
        setIsGrabbing(false);
      }
    };

    if (isGrabbing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isGrabbing, deck.track, deck.currentTime, getAngle, onScratch, onSeek]);

  // Needle position indicator in beats
  const beatProgress = deck.bpm > 0
    ? (deck.currentTime % (60 / deck.currentBpm)) / (60 / deck.currentBpm)
    : 0;

  return (
    <div className="flex flex-col items-center select-none">
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        style={{
          width: size,
          height: size,
          boxShadow: isGrabbing 
            ? `0 0 25px ${glowShadow}, inset 0 0 15px rgba(0,0,0,0.8)` 
            : '0 8px 24px rgba(0,0,0,0.7), inset 0 0 10px rgba(0,0,0,0.9)',
        }}
        className={`relative rounded-full cursor-grab active:cursor-grabbing border-4 ${
          isGrabbing ? activeBorder : 'border-[#1E2533]'
        } bg-[#0A0D13] flex items-center justify-center p-2 group transition-all duration-150`}
      >
        {/* Outer Knurled Aluminum CDJ Platter Ring */}
        <div className="absolute inset-0 rounded-full border border-[#2B3545] pointer-events-none opacity-80" />
        
        {/* Outer Jog Rim Touch Ticks (Nudge zones) */}
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[5px] bg-[#232B3A] rounded-full pointer-events-none"
            style={{
              transform: `rotate(${i * 10}deg) translateY(-${size / 2 - 7}px)`,
            }}
          />
        ))}

        {/* Rotating Vinyl Surface */}
        <div
          className="relative w-full h-full rounded-full vinyl-grooves overflow-hidden flex items-center justify-center shadow-inner"
          style={{
            transform: `rotate(${rotationAngle}deg)`,
            transition: isGrabbing ? 'none' : 'transform 0.05s linear',
          }}
        >
          {/* Vinyl Shiny Radial Lighting Reflection */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              background: 'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.4) 60deg, transparent 120deg, rgba(255,255,255,0.3) 240deg, transparent 300deg)',
            }}
          />

          {/* White Cue Point Position Marker Line on Vinyl */}
          <div
            className="absolute top-0 bottom-1/2 w-[3px] rounded-t-full shadow-lg"
            style={{
              backgroundColor: primaryColor,
              boxShadow: `0 0 8px ${primaryColor}`,
            }}
          />

          {/* Center Record Label / Artwork Disc */}
          <div
            className="relative w-24 h-24 rounded-full border-2 border-[#1E2533] bg-[#0E121A] flex flex-col items-center justify-center overflow-hidden shadow-2xl p-1"
          >
            {deck.track ? (
              <div
                className="w-full h-full rounded-full flex flex-col items-center justify-center text-center p-1"
                style={{
                  background: deck.track.artworkUrl || (colorScheme === 'cyan' ? '#083344' : '#4a044e'),
                }}
              >
                <Disc size={20} className={colorScheme === 'cyan' ? 'text-cyan-300' : 'text-fuchsia-300'} />
                <span className="text-[9px] font-bold text-white truncate max-w-[70px] mt-0.5 leading-tight">
                  {deck.track.title}
                </span>
                <span className="text-[8px] text-slate-300 truncate max-w-[65px] font-mono">
                  {deck.currentBpm.toFixed(1)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-600">
                <Disc size={22} />
                <span className="text-[8px] font-mono mt-1">NIGHTSHIFT</span>
              </div>
            )}

            {/* Spindle Center Hole */}
            <div className="absolute w-3.5 h-3.5 rounded-full bg-[#06070A] border border-[#2B3545] shadow-inner" />
          </div>
        </div>

        {/* Outer Perimeter LED Ring for Beat Position */}
        <div
          className="absolute inset-1 rounded-full pointer-events-none border border-transparent"
          style={{
            transform: `rotate(${beatProgress * 360}deg)`,
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full shadow-md"
            style={{
              backgroundColor: isGrabbing ? '#EF4444' : primaryColor,
              boxShadow: `0 0 8px ${primaryColor}`,
            }}
          />
        </div>
      </div>

      {/* Platter Nudge / Bend Buttons under the wheel */}
      <div className="flex items-center gap-2 mt-2 w-full justify-center">
        <button
          onClick={() => onNudge(-0.02)}
          title="Pitch Bend Down / Nudge -"
          className="px-2.5 py-0.5 rounded bg-[#11151D] hover:bg-[#1A212E] active:bg-cyan-950 text-slate-400 hover:text-white border border-[#252B36] text-[10px] font-mono font-bold transition-all"
        >
          - BEND
        </button>
        <span className={`text-[9px] font-mono tracking-wider font-semibold uppercase ${
          deck.vinylMode ? 'text-cyan-400' : 'text-slate-400'
        }`}>
          {deck.vinylMode ? 'VINYL ON' : 'CDJ MODE'}
        </span>
        <button
          onClick={() => onNudge(0.02)}
          title="Pitch Bend Up / Nudge +"
          className="px-2.5 py-0.5 rounded bg-[#11151D] hover:bg-[#1A212E] active:bg-cyan-950 text-slate-400 hover:text-white border border-[#252B36] text-[10px] font-mono font-bold transition-all"
        >
          + BEND
        </button>
      </div>
    </div>
  );
};

