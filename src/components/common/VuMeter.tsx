import React from 'react';

interface VuMeterProps {
  level: number; // 0.0 to 1.0 (or higher for clip)
  segments?: number;
  height?: number;
  width?: number;
  label?: string;
}

export const VuMeter: React.FC<VuMeterProps> = ({
  level,
  segments = 14,
  height = 140,
  width = 6,
  label,
}) => {
  // Clamp level to [0, 1.1]
  const clamped = Math.max(0, Math.min(1.1, level));
  const activeSegments = Math.round(clamped * segments);

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-[9px] font-mono font-medium text-[#73849B] mb-1">
          {label}
        </span>
      )}
      <div
        style={{ height, width: width + 4 }}
        className="flex flex-col-reverse justify-between bg-[#0B111A] p-[2px] rounded border border-[#26364A]"
      >
        {Array.from({ length: segments }).map((_, i) => {
          const isActive = i < activeSegments;
          const isClip = i >= segments - 2; // top 2 are red
          const isWarn = i >= segments - 5 && i < segments - 2; // middle 3 are amber

          let activeBg = '#34D399'; // Success green
          if (isClip) {
            activeBg = '#F87171'; // Error red
          } else if (isWarn) {
            activeBg = '#FBBF24'; // Warning amber
          }

          return (
            <div
              key={i}
              className="w-full rounded-[1px] transition-colors duration-75"
              style={{
                height: `${Math.floor((height - 12) / segments)}px`,
                backgroundColor: isActive ? activeBg : '#141F30',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
