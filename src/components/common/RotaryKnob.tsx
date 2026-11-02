import React, { useRef, useState, useEffect } from 'react';

interface RotaryKnobProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  /** If provided, the neutral/center value of a bipolar control (e.g. EQ = 0). */
  centerValue?: number;
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
  centerValue,
  defaultValue = 0,
  unit = '',
  size = 38,
  color = '#00E5FF',
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startValRef = useRef(0);

  const range = max - min;
  const norm = Math.max(0, Math.min(1, (value - min) / range));

  // Knob sweep: -135deg to +135deg (270 degrees of travel)
  const angle = -135 + norm * 270;

  // Neutral center position for bipolar controls
  const centerNorm = centerValue !== undefined ? (centerValue - min) / range : null;
  const centerAngle = centerNorm !== null ? -135 + centerNorm * 270 : null;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValRef.current = value;
  };

  const handleDoubleClick = () => onChange(defaultValue);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = range / 40;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(Math.min(max, value + step));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(Math.max(min, value - step));
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = startYRef.current - e.clientY;
      const step = range / 120; // full sweep over 120px of drag
      onChange(Math.max(min, Math.min(max, startValRef.current + deltaY * step)));
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, max, min, range, onChange]);

  const formattedVal =
    unit === 'dB'
      ? `${value > 0 ? '+' : ''}${value.toFixed(1)}`
      : unit === '%'
      ? `${Math.round(value * 100)}`
      : value.toFixed(2);

  // Half of the knob radius, with padding for the track ring
  const r = size / 2 - 4;
  const circumference = 2 * Math.PI * r;
  const arcFraction = 270 / 360;
  const arcLength = circumference * arcFraction;

  // Arc drawn clockwise from the start (bottom-left)
  const filledLength = norm * arcLength;

  // Handle center tick angle for bipolar controls
    centerAngle !== null
      ? (-135 + centerNorm! * 270) * (Math.PI / 180)
      : null;

  return (
    <div className="flex flex-col items-center select-none py-0.5">
      <span className="text-[8px] font-mono font-bold tracking-[0.14em] text-[#8490A3] mb-0.5 text-center leading-tight max-w-[52px]">
        {label}
      </span>

      {/* Rotary dial with value arc */}
      <div
        role="slider"
        aria-label={label}
        aria-valuenow={Math.round(value * 100) / 100}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        title={`${label}: ${formattedVal}${unit} — drag up/down, double-click resets`}
        style={{ width: size, height: size }}
        className={`relative rounded-full cursor-ns-resize outline-none transition-[box-shadow] ${
          isDragging ? '' : 'hover:brightness-110'
        }`}
      >
        {/* Value arc (SVG) */}
        <svg width={size} height={size} className="absolute inset-0 pointer-events-none">
          {/* Track arc: 270-degree gap at the bottom */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#151B26"
            strokeWidth={2.5}
            strokeDasharray={`${arcLength} ${circumference}`}
            transform={`rotate(135 ${size / 2} ${size / 2})`}
            strokeLinecap="round"
          />
          {/* Filled arc */}
          {filledLength > 0.5 && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeDasharray={`${filledLength} ${circumference}`}
              transform={`rotate(135 ${size / 2} ${size / 2})`}
              strokeLinecap="round"
              style={{ filter: isDragging ? `drop-shadow(0 0 3px ${color})` : undefined }}
            />
          )}
          {/* Center tick for bipolar controls */}
          {centerTick && (
            <line
              x1={size / 2 + Math.cos(centerTick) * (r - 2)}
              y1={size / 2 + Math.sin(centerTick) * (r - 2)}
              x2={size / 2 + Math.cos(centerTick) * (r + 3)}
              y2={size / 2 + Math.sin(centerTick) * (r + 3)}
              stroke="#3D4654"
              strokeWidth={1.5}
            />
          )}
        </svg>

        {/* Cap */}
        <div
          className="absolute inset-[4.5px] rounded-full bg-gradient-to-b from-[#232D3C] to-[#161C26] border border-[#2A3444] shadow-inset"
          style={{
            transform: `rotate(${angle}deg)`,
            transition: isDragging ? 'none' : 'transform 0.08s ease-out',
            boxShadow: isDragging ? `0 0 8px -2px ${color}` : undefined,
          }}
        >
          {/* Pointer line */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-[3px] w-[2px] h-[8px] rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      {/* Value readout */}
      <span className="text-[8px] font-mono text-[#5A6678] mt-0.5 tabular-nums group-hover:text-[#8490A3]">
        {formattedVal}
        {unit !== '%' ? unit : ''}
      </span>
    </div>
  );
};
