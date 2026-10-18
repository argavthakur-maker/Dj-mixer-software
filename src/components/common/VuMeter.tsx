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
  width = 8,
  label,
}) => {
  // Clamp level to [0, 1.1]
  const clamped = Math.max(0, Math.min(1.1, level));
  const activeSegments = Math.round(clamped * segments);

  return (
    <div className="flex flex-col items-center">
      {label && (
        <span className="text-[8px] font-mono font-bold text-slate-500 mb-0.5">
          {label}
        </span>
      )}
      <div
        style={{ height, width }}
        className="flex flex-col-reverse justify-between bg-[#080B10] p-[1.5px] rounded border border-[#1A212E]"
      >
        {Array.from({ length: segments }).map((_, i) => {
          const isActive = i < activeSegments;
          const isClip = i >= segments - 2; // top 2 are red
          const isWarn = i >= segments - 5 && i < segments - 2; // middle 3 are amber

          let activeBg = '#10B981'; // Green
          let activeGlow = 'rgba(16, 185, 129, 0.6)';

          if (isClip) {
            activeBg = '#EF4444'; // Red
            activeGlow = 'rgba(239, 68, 68, 0.8)';
          } else if (isWarn) {
            activeBg = '#F59E0B'; // Amber
            activeGlow = 'rgba(245, 158, 11, 0.7)';
          }

          return (
            <div
              key={i}
              className="w-full rounded-[0.5px] transition-all duration-75"
              style={{
                height: `${Math.floor((height - 10) / segments)}px`,
                backgroundColor: isActive ? activeBg : '#141822',
                boxShadow: isActive ? `0 0 4px ${activeGlow}` : 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

