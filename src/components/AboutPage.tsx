import React from 'react';
import { ThemeMode } from '../types';
import { ShieldCheck, Zap, Lock, Share2, Check, Calculator, GraduationCap, Building2, IdCard, Laptop, Calendar, BadgeCheck } from 'lucide-react';

interface AboutPageProps {
  theme: ThemeMode;
  onGoToCalculator: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ theme, onGoToCalculator }) => {
  const isDark = theme === 'dark';

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn py-4">
      {/* Hero Banner */}
      <div
        className={`rounded-3xl p-8 sm:p-12 border transition ${
          isDark
            ? 'bg-[#101216] border-[#1f242d] text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 border bg-blue-500/10 text-blue-400 border-blue-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Zero Sign-Up • 100% Client-Side • Privacy-First</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          About Free Calorie Calculator
        </h1>
        <p
          className={`text-sm sm:text-base mt-3 max-w-2xl leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          We built this tool to deliver accurate, instantaneous, and completely private metabolic insights with zero forced account creations, paywalls, or tracking cookies.
        </p>
      </div>

      {/* Creator & Academic Information Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border transition duration-300 relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-[#12151c] via-[#101217] to-[#0c0e12] border-[#222938] text-white shadow-xl'
            : 'bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border-slate-200 text-slate-900 shadow-md'
        }`}
      >
        <div className="relative z-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-blue-500/10 text-blue-400 border-blue-500/25">
              <BadgeCheck className="w-4 h-4 text-blue-400" />
              <span>Project Creator &amp; Lead Developer</span>
            </div>
            <div className={`text-xs px-3 py-1 rounded-full font-medium border ${
              isDark ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              B.Sc. I.T. Final Year Project
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-md shrink-0">
              RL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black">Roshan Lokhande</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  Lead Developer
                </span>
              </div>
              <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Creator of Free Calorie Calculator • Roll No: <strong>266597 (Batch A3)</strong> • <strong>Karmaveer Bhaurao Patil College, Vashi</strong> (Dept. of Information Technology, Final Year Sem 5)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-[#101216] border-[#1f242d] text-white' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base">Privacy by Architecture</h3>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Your biometric values (age, sex, height, weight) never touch our servers. All calculations run strictly in your browser.
          </p>
        </div>

        <div
          className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-[#101216] border-[#1f242d] text-white' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base">Instant Live Calculation</h3>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Calculations update synchronously in real-time as you type, with zero lag and lossless metric/imperial unit conversions.
          </p>
        </div>

        <div
          className={`p-6 rounded-3xl border space-y-3 ${
            isDark ? 'bg-[#101216] border-[#1f242d] text-white' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base">Shareable URL Results</h3>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Easily bookmark or send your custom calculation to coaches, friends, or workout partners using clean URL parameters.
          </p>
        </div>
      </div>

      {/* Checklist */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border space-y-4 ${
          isDark ? 'bg-[#101216] border-[#1f242d] text-white' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <h2 className="text-lg font-bold">Guaranteed Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          {[
            'Zero account creation or signups',
            'Zero email collection or marketing spam',
            'Peer-reviewed Mifflin-St Jeor equation',
            'Macronutrient targets (Protein, Carbs, Fats)',
            'Daily hydration cofactor target',
            'AI Food Scanner multimodal integration',
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{item}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 text-center">
          <button
            type="button"
            onClick={onGoToCalculator}
            className={`px-6 py-3 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
              isDark
                ? 'bg-white text-slate-950 hover:bg-slate-100'
                : 'bg-slate-950 text-white hover:bg-slate-800'
            }`}
          >
            Go to Calculator
          </button>
        </div>
      </div>
    </div>
  );
};
