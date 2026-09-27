import React from 'react';
import { ThemeMode } from '../types';

interface HeroSectionProps {
  theme: ThemeMode;
  onOpenCalculator: () => void;
  onOpenMethodology: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  theme,
  onOpenCalculator,
  onOpenMethodology,
}) => {
  const isDark = theme === 'dark';

  return (
    <section
      aria-label="Free Calorie Calculator Introduction"
      className="relative pt-8 sm:pt-14 pb-12 sm:pb-16 text-center space-y-7 animate-fadeIn max-w-4xl mx-auto px-4"
    >
      {/* Top Pill Badge matching Screenshot */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onOpenMethodology}
          aria-label="Read about the Mifflin-St Jeor scientific formula"
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer focus-visible:ring-2 focus-visible:ring-teal-400 ${
            isDark
              ? 'bg-[#18181b]/80 border-[#27272a] text-slate-300 hover:text-white hover:border-slate-500'
              : 'bg-white/85 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" aria-hidden="true" />
          <span>Built on the Mifflin-St Jeor equation</span>
          <span className="text-xs" aria-hidden="true">→</span>
        </button>
      </div>

      {/* Main Headline */}
      <div className="space-y-3">
        <h1
          id="hero-title"
          style={{ fontFamily: 'Verdana, sans-serif' }}
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-bold italic tracking-tight leading-[1.08] text-center ${
            isDark ? 'text-white' : 'text-[#09090b]'
          }`}
        >
          Health Meta
        </h1>
      </div>

      {/* CTA Buttons matching Screenshot */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
        <button
          type="button"
          onClick={onOpenCalculator}
          aria-label="Open the calorie calculator"
          className={`w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold transition cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            isDark
              ? 'bg-[#0c161d] border border-cyan-400/80 text-white shadow-[0_0_24px_rgba(6,182,212,0.45),inset_0_0_12px_rgba(6,182,212,0.15)] hover:shadow-[0_0_32px_rgba(6,182,212,0.65)] hover:border-cyan-300 hover:scale-[1.01]'
              : 'bg-[#09090b] text-white hover:bg-black hover:scale-[1.01] shadow-md'
          }`}
        >
          Open the calorie calculator
        </button>

        <button
          type="button"
          onClick={onOpenMethodology}
          aria-label="How it works - Learn calculation methodology"
          className={`w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold border transition cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 ${
            isDark
              ? 'bg-[#13161c] border border-white/15 text-slate-200 hover:text-white hover:bg-white/5 hover:border-white/30'
              : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
          }`}
        >
          How it works
        </button>
      </div>

      {/* Stat Bar (100% / 0 / 6) matching Screenshot */}
      <div className="pt-8 sm:pt-10 max-w-2xl mx-auto relative">
        <div
          className={`rounded-2xl border p-5 sm:p-6 grid grid-cols-3 divide-x transition ${
            isDark
              ? 'bg-[#0f0f12]/85 border-[#27272a] divide-[#27272a] text-white shadow-lg'
              : 'bg-[#f4f4f5]/60 border-slate-200/80 divide-slate-200 text-slate-900 shadow-2xs'
          }`}
        >
          {/* Column 1 */}
          <div className="text-center px-2">
            <span className="text-2xl sm:text-3xl font-extrabold block tracking-tight">100%</span>
            <span
              className={`text-[10px] sm:text-xs uppercase tracking-wider font-bold block mt-1.5 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              FREE, NO SIGNUP
            </span>
          </div>

          {/* Column 2 */}
          <div className="text-center px-2">
            <span className="text-2xl sm:text-3xl font-extrabold block tracking-tight">0</span>
            <span
              className={`text-[10px] sm:text-xs uppercase tracking-wider font-bold block mt-1.5 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              DATA SENT TO A SERVER
            </span>
          </div>

          {/* Column 3 */}
          <div className="text-center px-2">
            <span className="text-2xl sm:text-3xl font-extrabold block tracking-tight">6</span>
            <span
              className={`text-[10px] sm:text-xs uppercase tracking-wider font-bold block mt-1.5 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              INPUTS TO YOUR TARGET
            </span>
          </div>
        </div>

        {/* 4-point Sparkle Star in Bottom Right as seen in Screenshot */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute -right-16 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity"
        >
          <svg
            className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0 C12 6.627 6.627 12 0 12 C6.627 12 12 17.373 12 24 C12 17.373 17.373 12 24 12 C17.373 12 12 6.627 12 0 Z" />
          </svg>
        </div>
      </div>
    </section>
  );
};
