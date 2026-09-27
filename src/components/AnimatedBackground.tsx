import React from 'react';

interface AnimatedBackgroundProps {
  isDark?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ isDark = true }) => {
  if (isDark) {
    return (
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[#06080e] transition-colors duration-500"
        aria-hidden="true"
      >
        {/* Core Vibrant Emerald / Seafoam Green Aurora Bloom (Top-Left) */}
        <div
          className="absolute -top-[14%] -left-[10%] w-[68vw] h-[78vh] min-w-[480px] min-h-[480px] rounded-full blur-[115px] pointer-events-none opacity-95"
          style={{
            background:
              'radial-gradient(ellipse at 35% 30%, rgba(16, 185, 129, 0.68) 0%, rgba(5, 150, 105, 0.58) 25%, rgba(13, 148, 136, 0.48) 45%, rgba(6, 182, 212, 0.32) 65%, transparent 80%)',
          }}
        />

        {/* Secondary Intense Mint & Emerald Highlight Aura (Directly behind Left Hero) */}
        <div
          className="absolute top-[2%] left-[4%] w-[48vw] h-[58vh] min-w-[340px] min-h-[340px] rounded-full blur-[95px] pointer-events-none opacity-85"
          style={{
            background:
              'radial-gradient(circle at 30% 35%, rgba(52, 211, 153, 0.55) 0%, rgba(16, 185, 129, 0.42) 38%, rgba(4, 120, 87, 0.24) 62%, transparent 75%)',
          }}
        />

        {/* Deep Royal Purple & Indigo Aurora Bloom (Top-Right) */}
        <div
          className="absolute -top-[14%] -right-[10%] w-[68vw] h-[78vh] min-w-[480px] min-h-[480px] rounded-full blur-[130px] pointer-events-none opacity-85"
          style={{
            background:
              'radial-gradient(ellipse at 65% 30%, rgba(79, 70, 229, 0.58) 0%, rgba(124, 58, 237, 0.46) 32%, rgba(55, 48, 163, 0.26) 58%, transparent 78%)',
          }}
        />

        {/* Subtle Center Ambient Cyan/Teal Bridge between Green and Purple */}
        <div
          className="absolute top-[0%] left-[30%] w-[40vw] h-[45vh] rounded-full blur-[120px] pointer-events-none opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 75%)',
          }}
        />

        {/* High-Definition Micro Film Grain Texture Overlay */}
        <div
          className="absolute inset-0 opacity-[0.048] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    );
  }

  // Light Mode matching Screenshot 2
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 bg-white transition-colors duration-500"
      aria-hidden="true"
    >
      {/* Top-Left Soft Sky Blue Wash */}
      <div
        className="absolute -top-[14%] -left-[10%] w-[58vw] h-[65vh] min-w-[380px] min-h-[380px] rounded-full blur-[110px] opacity-90 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(219, 234, 254, 0.95) 0%, rgba(191, 219, 254, 0.65) 50%, transparent 75%)',
        }}
      />

      {/* Top-Right Soft Lilac / Lavender Wash */}
      <div
        className="absolute -top-[14%] -right-[10%] w-[58vw] h-[65vh] min-w-[380px] min-h-[380px] rounded-full blur-[120px] opacity-90 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(243, 232, 255, 0.95) 0%, rgba(233, 213, 255, 0.65) 50%, transparent 75%)',
        }}
      />
    </div>
  );
};
