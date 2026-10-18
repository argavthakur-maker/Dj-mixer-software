import React, { useRef, useEffect, useCallback } from 'react';
import type { DeckState } from '../../types/dj';

interface ScrollingWaveformProps {
  deck: DeckState;
  colorScheme: 'cyan' | 'violet';
  zoom: number; // pixels per second (e.g. 80 to 240)
  height?: number;
  onSeek: (time: number) => void;
  onScratch?: (delta: number) => void;
  showBeatGrid?: boolean;
}

export const ScrollingWaveform: React.FC<ScrollingWaveformProps> = ({
  deck,
  colorScheme,
  zoom,
  height = 96,
  onSeek,
  onScratch,
  showBeatGrid = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);

  const primaryColor = colorScheme === 'cyan' ? '#00E5FF' : '#D946EF';
  const midColor = colorScheme === 'cyan' ? '#0284C7' : '#8B5CF6';
  const bassColor = colorScheme === 'cyan' ? '#38BDF8' : '#F43F5E';
  const gridColor = colorScheme === 'cyan' ? 'rgba(0, 229, 255, 0.25)' : 'rgba(217, 70, 239, 0.25)';
  const playheadGlow = colorScheme === 'cyan' ? 'rgba(0, 229, 255, 0.8)' : 'rgba(217, 70, 239, 0.8)';

  // Draw 60fps scrolling waveform synced to deck.currentTime
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const h = canvas.height;
    const centerY = h / 2;

    // Clear background
    ctx.fillStyle = '#0B0E14';
    ctx.fillRect(0, 0, width, h);

    const track = deck.track;
    if (!track || !track.waveformData) {
      // Empty deck placeholder
      ctx.fillStyle = '#1A212E';
      ctx.fillRect(0, centerY - 1, width, 2);
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#4B5565';
      ctx.textAlign = 'center';
      ctx.fillText('NO TRACK LOADED IN DECK ' + deck.id, width / 2, centerY + 4);
      return;
    }

    const currentTime = deck.currentTime;
    const duration = track.duration;
    const playheadX = width / 2; // Center playhead

    const waveform = track.waveformData;
    const bands = track.colorBandData;
    const totalPoints = waveform.length;

    // Calculate time window visible on screen
    const visibleDuration = width / zoom;
    const startTime = currentTime - (visibleDuration / 2);
    const endTime = currentTime + (visibleDuration / 2);

    // 1. Draw Active Loop Region
    if (deck.loop.active && deck.loop.end > deck.loop.start) {
      const loopStartX = playheadX + ((deck.loop.start - currentTime) * zoom);
      const loopEndX = playheadX + ((deck.loop.end - currentTime) * zoom);

      ctx.fillStyle = colorScheme === 'cyan' ? 'rgba(0, 229, 255, 0.12)' : 'rgba(217, 70, 239, 0.12)';
      ctx.fillRect(loopStartX, 0, loopEndX - loopStartX, h);

      // Loop boundaries
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(loopStartX, 0);
      ctx.lineTo(loopStartX, h);
      ctx.moveTo(loopEndX, 0);
      ctx.lineTo(loopEndX, h);
      ctx.stroke();

      // Loop top bar
      ctx.fillStyle = primaryColor;
      ctx.fillRect(loopStartX, 0, loopEndX - loopStartX, 3);
    }

    // 2. Draw Beat Grid Lines
    if (showBeatGrid && deck.bpm > 0) {
      const beatSec = 60 / deck.bpm;
      const firstBeatIndex = Math.floor(startTime / beatSec);
      const lastBeatIndex = Math.ceil(endTime / beatSec);

      for (let b = firstBeatIndex; b <= lastBeatIndex; b++) {
        const beatTime = b * beatSec;
        const x = playheadX + ((beatTime - currentTime) * zoom);
        if (x < -10 || x > width + 10) continue;

        const isBar = b % 4 === 0;
        ctx.strokeStyle = isBar ? gridColor : 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = isBar ? 1.5 : 0.8;

        ctx.beginPath();
        ctx.moveTo(x, isBar ? 0 : 6);
        ctx.lineTo(x, isBar ? h : h - 6);
        ctx.stroke();

        // Bar numbers
        if (isBar && b >= 0) {
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = isBar ? (colorScheme === 'cyan' ? '#00E5FF' : '#EC4899') : '#64748B';
          ctx.textAlign = 'center';
          const barNum = Math.floor(b / 4) + 1;
          ctx.fillText(String(barNum), x, 11);
        }
      }
    }

    // 3. Draw High-Performance Waveform Bars
    const barWidth = 2;
    const barGap = 1;
    const step = barWidth + barGap;

    for (let x = 0; x < width; x += step) {
      const timeAtX = startTime + ((x / width) * visibleDuration);
      if (timeAtX < 0 || timeAtX > duration) continue;

      const pointIdx = Math.floor((timeAtX / duration) * totalPoints);
      if (pointIdx < 0 || pointIdx >= totalPoints) continue;

      const amp = waveform[pointIdx];
      const barHeight = Math.max(3, amp * (h - 18));

      // 3-Band Color blending
      if (bands) {
        const low = bands.low[pointIdx] || 0;
        const mid = bands.mid[pointIdx] || 0;
        const high = bands.high[pointIdx] || 0;

        // Draw layered frequencies: Low (Center), Mid, High
        const lowH = low * (h * 0.45);
        const midH = mid * (h * 0.35);
        const highH = high * (h * 0.25);

        // Bass layer (deep core)
        ctx.fillStyle = bassColor;
        ctx.fillRect(x, centerY - lowH / 2, barWidth, lowH);

        // Mid layer
        ctx.fillStyle = midColor;
        ctx.fillRect(x, centerY - midH / 2, barWidth, midH);

        // High layer (bright edges)
        ctx.fillStyle = primaryColor;
        ctx.fillRect(x, centerY - (barHeight / 2), barWidth, Math.max(2, highH));
        ctx.fillRect(x, centerY + (barHeight / 2) - highH, barWidth, Math.max(2, highH));
      } else {
        // Monochromatic gradient fallback
        ctx.fillStyle = primaryColor;
        ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
      }
    }

    // 4. Draw Hot Cue Flags
    if (deck.hotCues && deck.hotCues.length > 0) {
      deck.hotCues.forEach((cue) => {
        const cueX = playheadX + ((cue.position - currentTime) * zoom);
        if (cueX >= -20 && cueX <= width + 20) {
          // Flag pole
          ctx.strokeStyle = cue.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cueX, 0);
          ctx.lineTo(cueX, h);
          ctx.stroke();

          // Flag header marker
          ctx.fillStyle = cue.color;
          ctx.beginPath();
          ctx.moveTo(cueX, 2);
          ctx.lineTo(cueX + 14, 2);
          ctx.lineTo(cueX + 18, 9);
          ctx.lineTo(cueX + 14, 16);
          ctx.lineTo(cueX, 16);
          ctx.closePath();
          ctx.fill();

          // Cue ID
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText(String(cue.id), cueX + 3, 12);
        }
      });
    }

    // 5. Center Playhead Laser Marker
    ctx.shadowColor = playheadGlow;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, h);
    ctx.stroke();

    // Top and bottom triangular playhead indicators
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(playheadX - 5, 0);
    ctx.lineTo(playheadX + 5, 0);
    ctx.lineTo(playheadX, 7);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(playheadX - 5, h);
    ctx.lineTo(playheadX + 5, h);
    ctx.lineTo(playheadX, h - 7);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0; // Reset shadow
  }, [deck, colorScheme, zoom, height, showBeatGrid, primaryColor, midColor, bassColor, gridColor, playheadGlow]);

  // Animation frame loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      render();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [render]);

  // Canvas size handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse interaction: Drag to scrub / scratch / seek
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !deck.track) return;
    const deltaX = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;

    // Convert pixel delta to time delta
    const timeDelta = -deltaX / zoom;
    const newTime = Math.max(0, Math.min(deck.currentTime + timeDelta, deck.track.duration));
    onSeek(newTime);

    if (onScratch) {
      onScratch(deltaX);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !deck.track) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const playheadX = rect.width / 2;
    const timeOffset = (clickX - playheadX) / zoom;
    const targetTime = Math.max(0, Math.min(deck.currentTime + timeOffset, deck.track.duration));
    onSeek(targetTime);
  };

  return (
    <div 
      className="relative w-full overflow-hidden rounded bg-[#090B10] border border-[#1F2633] cursor-ew-resize select-none"
      style={{ height }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      />
      {/* Deck Indicator Watermark */}
      <div className={`absolute top-1.5 left-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
        colorScheme === 'cyan' 
          ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/30' 
          : 'bg-fuchsia-950/80 text-fuchsia-400 border border-fuchsia-500/30'
      }`}>
        DECK {deck.id}
      </div>
    </div>
  );
};
