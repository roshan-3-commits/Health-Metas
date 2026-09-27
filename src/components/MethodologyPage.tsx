import React from 'react';
import { ThemeMode } from '../types';
import { BookOpen, Calculator, ArrowRight, ShieldCheck, Activity, Droplets, PieChart } from 'lucide-react';

interface MethodologyPageProps {
  theme: ThemeMode;
  onGoToCalculator: () => void;
}

export const MethodologyPage: React.FC<MethodologyPageProps> = ({ theme, onGoToCalculator }) => {
  const isDark = theme === 'dark';

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn py-4">
      {/* Header Banner */}
      <div
        className={`rounded-3xl p-8 sm:p-12 border transition ${
          isDark
            ? 'bg-[#101216] border-[#1f242d] text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Peer-Reviewed Clinical Physiology</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          How the Math Works: Methodology
        </h1>
        <p
          className={`text-sm sm:text-base mt-3 max-w-2xl leading-relaxed ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
        >
          Our calculator uses the peer-reviewed Mifflin-St Jeor equation, recognized as the clinical standard by the Academy of Nutrition and Dietetics for estimating human metabolic expenditure.
        </p>
      </div>

      {/* 1. BMR Equation */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border space-y-6 ${
          isDark
            ? 'bg-[#101216] border-[#1f242d] text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="text-lg font-bold">The Mifflin-St Jeor Equation (BMR)</h2>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Basal Metabolic Rate: Caloric requirements at complete rest
            </p>
          </div>
        </div>

        <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Published in 1990 by Dr. M. D. Mifflin and S. T. St Jeor in the <em>American Journal of Clinical Nutrition</em>, this formula accounts for lean mass variations across biological sexes:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm font-mono">
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#161920] border-[#252b36]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[11px] font-sans font-bold text-blue-400 block mb-1">
              Men (Biological Sex)
            </span>
            <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 text-slate-200 font-bold">
              BMR = (10 × W) + (6.25 × H) - (5 × A) + 5
            </div>
            <p className={`text-[11px] font-sans mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              W = weight in kg, H = height in cm, A = age in years.
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#161920] border-[#252b36]' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <span className="text-[11px] font-sans font-bold text-purple-400 block mb-1">
              Women (Biological Sex)
            </span>
            <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 text-slate-200 font-bold">
              BMR = (10 × W) + (6.25 × H) - (5 × A) - 161
            </div>
            <p className={`text-[11px] font-sans mt-2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              The -161 offset accounts for physiological baseline differences.
            </p>
          </div>
        </div>
      </div>

      {/* 2. TDEE Multipliers */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border space-y-6 ${
          isDark
            ? 'bg-[#101216] border-[#1f242d] text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h2 className="text-lg font-bold">Physical Activity Multipliers (TDEE)</h2>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Total Daily Energy Expenditure = BMR × Activity Factor
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr
                className={`border-b ${
                  isDark ? 'border-[#1f242d] text-slate-400' : 'border-slate-200 text-slate-600'
                }`}
              >
                <th className="py-2.5 px-3 font-semibold">Activity Level</th>
                <th className="py-2.5 px-3 font-semibold">Factor</th>
                <th className="py-2.5 px-3 font-semibold">Weekly Lifestyle</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-[#1a1e27]' : 'divide-slate-100'}`}>
              <tr>
                <td className="py-3 px-3 font-medium">Sedentary</td>
                <td className="py-3 px-3 font-bold text-blue-400">1.200</td>
                <td className={`py-3 px-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Desk job, little to no structured workout
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium">Lightly Active</td>
                <td className="py-3 px-3 font-bold text-blue-400">1.375</td>
                <td className={`py-3 px-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Light exercise 1–3 days/week
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium">Moderately Active</td>
                <td className="py-3 px-3 font-bold text-blue-400">1.550</td>
                <td className={`py-3 px-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Moderate exercise or lifting 3–5 days/week
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium">Very Active</td>
                <td className="py-3 px-3 font-bold text-blue-400">1.725</td>
                <td className={`py-3 px-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Hard athletic training 6–7 days/week
                </td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-medium">Extremely Active</td>
                <td className="py-3 px-3 font-bold text-blue-400">1.900</td>
                <td className={`py-3 px-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Heavy physical job or 2x/day athlete training
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={onGoToCalculator}
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold transition cursor-pointer ${
            isDark
              ? 'bg-white text-slate-950 hover:bg-slate-100'
              : 'bg-slate-950 text-white hover:bg-slate-800'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Launch Free Calculator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
