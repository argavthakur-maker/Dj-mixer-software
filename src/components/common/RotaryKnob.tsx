import React, { useRef, useState, useEffect } from 'react';

interface RotaryKnobProps {
  label: string;
  value: number; // current value
  min?: number;
  max?: number;
  defaultValue?: number;
  unit?: string;
  size?: number;
  color?: string;
  onChange: (newValue: number) => void;
}

export const RotaryKnob: React.FC<RotaryKnobProps> = ({
  label,
  value,
  min = 0,
  max = 1,
  defaultValue = 0,
  unit = '',
  size = 40,
  color = '#00E5FF',
  onChange,
}) => {
  const knobRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValRef = useRef(0);

  // Map value to angle (-135 deg to +135 deg: total 270 deg rotation)
  const norm = (value - min) / (max - min);
  const angle = -135 + (norm * 270);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValRef.current = value;
  };

  const handleDoubleClick = () => {
    onChange(defaultValue);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = startYRef.current - e.clientY; // drag up increases
      const range = max - min;
      const step = range / 120; // 120 pixels for full sweep
      let newVal = startValRef.current + (deltaY * step);
      newVal = Math.max(min, Math.min(max, newVal));
      onChange(newVal);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, max, min, onChange]);

  // Format readout value
  const formattedVal = unit === 'dB'
    ? `${value > 0 ? '+' : ''}${value.toFixed(1)}`
    : unit === '%'
    ? `${Math.round(value * 100)}`
    : value.toFixed(2);

  return (
    <div className="flex flex-col items-center select-none group">
      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tight mb-1">
        {label}
      </span>

      {/* Rotary Dial */}
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title={`${label}: ${formattedVal}${unit} (Drag up/down, Double-click to reset)`}
        style={{ width: size, height: size }}
        className="relative rounded-full cursor-ns-resize bg-[#0C0F16] border border-[#252E3E] shadow-md flex items-center justify-center hover:border-slate-400 active:border-cyan-400 transition-colors"
      >
        {/* Outer tick marks */}
        <div className="absolute inset-0 rounded-full border border-black/60 pointer-events-none" />

        {/* Center Knob Cap with knurling */}
        <div
          className="relative rounded-full bg-gradient-to-b from-[#252E3D] via-[#161B26] to-[#0A0D14] shadow-inner flex items-center justify-center"
          style={{
            width: size - 8,
            height: size - 8,
            transform: `rotate(${angle}deg)`,
            transition: isDragging ? 'none' : 'transform 0.05s ease-out',
          }}
        >
          {/* Radial Pointer Line */}
          <div
            className="absolute top-1 w-[2px] h-[7px] rounded-full shadow-sm"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 5px ${color}`,
            }}
          />
        </div>
      </div>

      {/* Value Readout */}
      <span className="text-[8px] font-mono text-slate-500 mt-0.5 group-hover:text-slate-300">
        {formattedVal}{unit}
      </span>
    </div>
  );
};
