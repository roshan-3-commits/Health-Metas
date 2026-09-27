import React, { useState } from 'react';
import {
  ActivityLevel,
  CalculationResult,
  CalculatorInputs,
  Gender,
  GoalCalorieTier,
  PrimaryGoal,
  ThemeMode,
} from '../types';
import { ACTIVITY_OPTIONS } from '../utils/calculator';
import { WeightProjectionChart } from './WeightProjectionChart';
import {
  Calculator,
  Share2,
  Check,
  Sparkles,
  Droplets,
  Scale,
  Calendar,
  RotateCcw,
  Utensils,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface CalculatorSectionProps {
  inputs: CalculatorInputs;
  setInputs: React.Dispatch<React.SetStateAction<CalculatorInputs>>;
  result: CalculationResult | null;
  onSetDailyTarget: (calories: number, label: string) => void;
  onScanFoodShortcut: () => void;
  onOpenTracker: () => void;
  onShareLink: () => void;
  shareCopied: boolean;
  theme: ThemeMode;
}

export const CalculatorSection: React.FC<CalculatorSectionProps> = ({
  inputs,
  setInputs,
  result,
  onSetDailyTarget,
  onScanFoodShortcut,
  onOpenTracker,
  onShareLink,
  shareCopied,
  theme,
}) => {
  const isDark = theme === 'dark';

  // Unit system
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [heightFeet, setHeightFeet] = useState<number | ''>(5);
  const [heightInches, setHeightInches] = useState<number | ''>(9);
  const [weightLbs, setWeightLbs] = useState<number | ''>(154);

  // Selected tier for detailed viewing
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);

  const handleUnitToggle = (unit: 'metric' | 'imperial') => {
    if (unit === unitSystem) return;
    setUnitSystem(unit);

    if (unit === 'imperial') {
      if (inputs.heightCm) {
        const totalInches = Number(inputs.heightCm) / 2.54;
        const ft = Math.floor(totalInches / 12);
        const inch = Math.round(totalInches % 12);
        setHeightFeet(ft);
        setHeightInches(inch);
      }
      if (inputs.weightKg) {
        setWeightLbs(Math.round(Number(inputs.weightKg) * 2.20462));
      }
    } else {
      if (heightFeet !== '' && heightInches !== '') {
        const totalCm = Math.round((Number(heightFeet) * 12 + Number(heightInches)) * 2.54);
        setInputs((prev) => ({ ...prev, heightCm: totalCm }));
      }
      if (weightLbs !== '') {
        const totalKg = Math.round(Number(weightLbs) / 2.20462);
        setInputs((prev) => ({ ...prev, weightKg: totalKg }));
      }
    }
  };

  const handleImperialHeightChange = (ft: number | '', inch: number | '') => {
    setHeightFeet(ft);
    setHeightInches(inch);
    if (ft !== '' || inch !== '') {
      const feetVal = Number(ft) || 0;
      const inchVal = Number(inch) || 0;
      const cm = Math.round((feetVal * 12 + inchVal) * 2.54);
      setInputs((prev) => ({ ...prev, heightCm: cm > 0 ? cm : '' }));
    }
  };

  const handleImperialWeightChange = (lbs: number | '') => {
    setWeightLbs(lbs);
    if (lbs !== '') {
      const kg = Math.round(Number(lbs) / 2.20462);
      setInputs((prev) => ({ ...prev, weightKg: kg > 0 ? kg : '' }));
    } else {
      setInputs((prev) => ({ ...prev, weightKg: '' }));
    }
  };

  // Determine active displayed tier
  const activeTier =
    (result && selectedTierId && result.allTiers.find((t) => t.id === selectedTierId)) ||
    (result ? result.activeGoalTier : null);

  const currentActivity = ACTIVITY_OPTIONS.find((a) => a.value === inputs.activityLevel) || ACTIVITY_OPTIONS[0];

  return (
    <section id="calculator" className="space-y-8 animate-fadeIn pt-2">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <h2
          className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Calorie calculator with{' '}
          <span className="text-blue-500">macro</span>{' '}
          <span className="text-purple-400">&amp;</span>{' '}
          <span className="text-amber-500">water</span>{' '}
          <span className="text-amber-400">targets</span>
        </h2>
      </div>

      {/* Two Column Layout matching Screenshot 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Form Card */}
        <div
          className={`rounded-3xl p-6 sm:p-8 border shadow-sm transition-colors space-y-6 ${
            isDark
              ? 'bg-[#101216] border-[#1f242d] text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          {/* Unit Toggle */}
          <div className="flex justify-between items-center pb-2">
            <div
              className={`flex p-1 rounded-xl border text-xs font-bold ${
                isDark ? 'bg-[#181b22] border-[#292f3b]' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => handleUnitToggle('metric')}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                  unitSystem === 'metric'
                    ? isDark
                      ? 'bg-[#252b36] text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Metric <span className="text-[11px] font-normal opacity-70">cm / kg</span>
              </button>
              <button
                type="button"
                onClick={() => handleUnitToggle('imperial')}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer ${
                  unitSystem === 'imperial'
                    ? isDark
                      ? 'bg-[#252b36] text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Imperial <span className="text-[11px] font-normal opacity-70">ft·in / lb</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setInputs({
                  age: 30,
                  gender: 'male',
                  heightCm: 175,
                  weightKg: 70,
                  activityLevel: 'sedentary',
                  goal: 'maintain',
                  targetWeightKg: '',
                  formula: 'mifflin',
                });
                setSelectedTierId(null);
              }}
              title="Reset to sample values"
              className={`p-2 rounded-xl border text-xs transition cursor-pointer ${
                isDark
                  ? 'border-[#262b35] text-slate-400 hover:text-white bg-[#16181e]'
                  : 'border-slate-200 text-slate-500 hover:text-slate-900 bg-slate-50'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Fields matching Screenshot 2 */}
          <div className="space-y-5">
            {/* Age & Sex Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label
                  htmlFor="input-age"
                  className={`block text-xs font-semibold mb-1.5 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Age
                </label>
                <div className="relative">
                  <input
                    id="input-age"
                    type="number"
                    min="15"
                    max="80"
                    placeholder="30"
                    value={inputs.age}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        age: e.target.value === '' ? '' : parseInt(e.target.value, 10),
                      }))
                    }
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold focus:outline-none transition ${
                      isDark
                        ? 'bg-[#161920] border-[#272d38] text-white focus:border-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'
                    }`}
                  />
                  <span
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    years
                  </span>
                </div>
                <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Between 15 and 80.
                </p>
              </div>

              {/* Biological Sex */}
              <div>
                <label
                  className={`block text-xs font-semibold mb-1.5 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Biological sex
                </label>
                <div
                  className={`grid grid-cols-2 p-1 rounded-2xl border text-xs font-bold ${
                    isDark ? 'bg-[#161920] border-[#272d38]' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setInputs((prev) => ({ ...prev, gender: 'male' }))}
                    className={`py-2.5 rounded-xl transition cursor-pointer ${
                      inputs.gender === 'male'
                        ? isDark
                          ? 'bg-[#252b36] text-white shadow-xs'
                          : 'bg-white text-slate-950 shadow-xs'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputs((prev) => ({ ...prev, gender: 'female' }))}
                    className={`py-2.5 rounded-xl transition cursor-pointer ${
                      inputs.gender === 'female'
                        ? isDark
                          ? 'bg-[#252b36] text-white shadow-xs'
                          : 'bg-white text-slate-950 shadow-xs'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>
            </div>

            {/* Height */}
            <div>
              <label
                htmlFor="input-height"
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Height
              </label>
              {unitSystem === 'metric' ? (
                <div className="relative">
                  <input
                    id="input-height"
                    type="number"
                    min="50"
                    max="260"
                    placeholder="175"
                    value={inputs.heightCm}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        heightCm: e.target.value === '' ? '' : parseFloat(e.target.value),
                      }))
                    }
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold focus:outline-none transition ${
                      isDark
                        ? 'bg-[#161920] border-[#272d38] text-white focus:border-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'
                    }`}
                  />
                  <span
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    cm
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      min="3"
                      max="8"
                      placeholder="5"
                      value={heightFeet}
                      onChange={(e) =>
                        handleImperialHeightChange(
                          e.target.value === '' ? '' : parseInt(e.target.value, 10),
                          heightInches
                        )
                      }
                      className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold focus:outline-none ${
                        isDark
                          ? 'bg-[#161920] border-[#272d38] text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      ft
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      placeholder="9"
                      value={heightInches}
                      onChange={(e) =>
                        handleImperialHeightChange(
                          heightFeet,
                          e.target.value === '' ? '' : parseInt(e.target.value, 10)
                        )
                      }
                      className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold focus:outline-none ${
                        isDark
                          ? 'bg-[#161920] border-[#272d38] text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      in
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Weight */}
            <div>
              <label
                htmlFor="input-weight"
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Weight
              </label>
              {unitSystem === 'metric' ? (
                <div className="relative">
                  <input
                    id="input-weight"
                    type="number"
                    min="20"
                    max="350"
                    step="0.1"
                    placeholder="70"
                    value={inputs.weightKg}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        weightKg: e.target.value === '' ? '' : parseFloat(e.target.value),
                      }))
                    }
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold focus:outline-none transition ${
                      isDark
                        ? 'bg-[#161920] border-[#272d38] text-white focus:border-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'
                    }`}
                  />
                  <span
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    kg
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max="700"
                    step="0.1"
                    placeholder="154"
                    value={weightLbs}
                    onChange={(e) =>
                      handleImperialWeightChange(
                        e.target.value === '' ? '' : parseFloat(e.target.value)
                      )
                    }
                    className={`w-full px-4 py-3 rounded-2xl border text-sm font-bold focus:outline-none transition ${
                      isDark
                        ? 'bg-[#161920] border-[#272d38] text-white focus:border-blue-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'
                    }`}
                  />
                  <span
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  >
                    lb
                  </span>
                </div>
              )}
            </div>

            {/* Activity Level */}
            <div>
              <label
                htmlFor="input-activity"
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Activity level
              </label>
              <div className="relative">
                <select
                  id="input-activity"
                  value={inputs.activityLevel}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      activityLevel: e.target.value as ActivityLevel,
                    }))
                  }
                  className={`w-full px-4 py-3 rounded-2xl border text-xs sm:text-sm font-bold appearance-none cursor-pointer focus:outline-none transition ${
                    isDark
                      ? 'bg-[#161920] border-[#272d38] text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'
                  }`}
                >
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className={isDark ? 'bg-[#161920]' : ''}>
                      {opt.label} — {opt.description} (×{opt.multiplier})
                    </option>
                  ))}
                </select>
                <div
                  className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  ▼
                </div>
              </div>
            </div>

            {/* Goal */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                Goal
              </label>
              <div
                className={`grid grid-cols-3 p-1 rounded-2xl border text-xs font-bold ${
                  isDark ? 'bg-[#161920] border-[#272d38]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setInputs((prev) => ({ ...prev, goal: 'lose' }));
                    setSelectedTierId(null);
                  }}
                  className={`py-2.5 rounded-xl transition cursor-pointer ${
                    inputs.goal === 'lose'
                      ? isDark
                        ? 'bg-[#252b36] text-white shadow-xs'
                        : 'bg-white text-slate-950 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lose weight
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputs((prev) => ({ ...prev, goal: 'maintain' }));
                    setSelectedTierId(null);
                  }}
                  className={`py-2.5 rounded-xl transition cursor-pointer ${
                    inputs.goal === 'maintain'
                      ? isDark
                        ? 'bg-[#252b36] text-white shadow-xs'
                        : 'bg-white text-slate-950 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Maintain
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputs((prev) => ({ ...prev, goal: 'gain' }));
                    setSelectedTierId(null);
                  }}
                  className={`py-2.5 rounded-xl transition cursor-pointer ${
                    inputs.goal === 'gain'
                      ? isDark
                        ? 'bg-[#252b36] text-white shadow-xs'
                        : 'bg-white text-slate-950 shadow-xs'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Gain weight
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Results matching Screenshot 2 */}
        {result && activeTier ? (
          <div
            className={`rounded-3xl p-6 sm:p-8 border shadow-sm transition-colors space-y-6 ${
              isDark
                ? 'bg-[#101216] border-[#1f242d] text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Top Subtitle & Big Number matching Screenshot 2 */}
            <div className="space-y-1">
              <span
                className={`text-[11px] uppercase tracking-widest font-bold block ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                DAILY TARGET
              </span>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black tracking-tight">
                  {activeTier.calories.toLocaleString()}
                </span>
                <span
                  className={`text-xl font-normal ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  kcal
                </span>
              </div>

              <p
                className={`text-sm font-medium pt-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {activeTier.id === 'maintain'
                  ? 'Maintain · 0 kcal maintenance'
                  : activeTier.diff < 0
                  ? `Lose · ${Math.abs(activeTier.diff)} kcal deficit (${activeTier.paceDescription})`
                  : `Gain · ${activeTier.diff} kcal surplus (${activeTier.paceDescription})`}
              </p>
            </div>

            {/* 3 Metric Columns matching Screenshot 2 */}
            <div
              className={`grid grid-cols-3 gap-3 py-4 border-y ${
                isDark ? 'border-[#1f242d]' : 'border-slate-100'
              }`}
            >
              {/* BMR */}
              <div>
                <span
                  className={`text-[11px] uppercase tracking-wider font-bold block ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  BMR
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg sm:text-xl font-extrabold">{result.bmr.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400">kcal</span>
                </div>
                <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  At complete rest
                </span>
              </div>

              {/* TDEE */}
              <div>
                <span
                  className={`text-[11px] uppercase tracking-wider font-bold block ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  TDEE
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-lg sm:text-xl font-extrabold">{result.tdee.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400">kcal</span>
                </div>
                <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {currentActivity.label}
                </span>
              </div>

              {/* DEFICIT / SURPLUS */}
              <div>
                <span
                  className={`text-[11px] uppercase tracking-wider font-bold block ${
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}
                >
                  DEFICIT / SURPLUS
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span
                    className={`text-lg sm:text-xl font-extrabold ${
                      activeTier.diff === 0
                        ? ''
                        : activeTier.diff < 0
                        ? 'text-rose-500'
                        : 'text-emerald-500'
                    }`}
                  >
                    {activeTier.diff > 0 ? `+${activeTier.diff}` : activeTier.diff}
                  </span>
                  <span className="text-[11px] text-slate-400">kcal</span>
                </div>
                <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {activeTier.diff === 0 ? 'Steady state' : activeTier.paceDescription}
                </span>
              </div>
            </div>

            {/* Macronutrient Targets Section matching Screenshot 2 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold">Macronutrient targets</span>
                <span
                  className={`font-medium ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Tailored for {activeTier.title.toLowerCase()}
                </span>
              </div>

              {/* Visual Split Bar (Blue/Cyan for Protein, Purple for Carbs, Amber for Fat) */}
              <div className="h-3 rounded-full overflow-hidden flex bg-slate-800/40">
                <div
                  style={{ width: `${activeTier.macros.proteinPct}%` }}
                  className="bg-blue-500 h-full transition-all"
                  title={`Protein: ${activeTier.macros.proteinPct}%`}
                />
                <div
                  style={{ width: `${activeTier.macros.carbsPct}%` }}
                  className="bg-purple-500 h-full transition-all"
                  title={`Carbs: ${activeTier.macros.carbsPct}%`}
                />
                <div
                  style={{ width: `${activeTier.macros.fatPct}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title={`Fat: ${activeTier.macros.fatPct}%`}
                />
              </div>

              {/* 3 Macro Cards */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {/* Protein */}
                <div
                  className={`p-3 rounded-2xl border ${
                    isDark
                      ? 'bg-[#15181f] border-[#252b36]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-blue-500">Protein</span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                      {activeTier.macros.proteinPct}%
                    </span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl font-black">{activeTier.macros.proteinG}</span>
                    <span className="text-[11px] text-slate-400 ml-0.5">g</span>
                  </div>
                  <span className={`text-[10px] block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {activeTier.macros.proteinKcal} kcal
                  </span>
                </div>

                {/* Carbs */}
                <div
                  className={`p-3 rounded-2xl border ${
                    isDark
                      ? 'bg-[#15181f] border-[#252b36]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-purple-400">Carbs</span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                      {activeTier.macros.carbsPct}%
                    </span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl font-black">{activeTier.macros.carbsG}</span>
                    <span className="text-[11px] text-slate-400 ml-0.5">g</span>
                  </div>
                  <span className={`text-[10px] block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {activeTier.macros.carbsKcal} kcal
                  </span>
                </div>

                {/* Fat */}
                <div
                  className={`p-3 rounded-2xl border ${
                    isDark
                      ? 'bg-[#15181f] border-[#252b36]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-400">Fat</span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                      {activeTier.macros.fatPct}%
                    </span>
                  </div>
                  <div className="my-1">
                    <span className="text-xl font-black">{activeTier.macros.fatG}</span>
                    <span className="text-[11px] text-slate-400 ml-0.5">g</span>
                  </div>
                  <span className={`text-[10px] block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {activeTier.macros.fatKcal} kcal
                  </span>
                </div>
              </div>
            </div>

            {/* Water Target & Goal Tiers Selector */}
            <div className="space-y-3 pt-2">
              {/* Water Target Box */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                  isDark
                    ? 'bg-[#15181f] border-[#252b36] text-slate-300'
                    : 'bg-blue-50/60 border-blue-100 text-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="font-bold">Water target:</span>
                  <span className="font-extrabold text-blue-400">
                    {result.waterIntakeLiters} L ({result.waterIntakeOz} oz)
                  </span>
                </div>
                <span className={`text-[10px] hidden sm:inline ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                  35 ml/kg baseline
                </span>
              </div>

              {/* Goal Tiers Quick Selection Pills */}
              <div>
                <span className={`text-[11px] font-semibold block mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Explore alternative paces:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.allTiers.map((tier) => {
                    const isSelected = activeTier.id === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setSelectedTierId(tier.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                          isSelected
                            ? isDark
                              ? 'bg-white text-slate-950 border-white font-bold'
                              : 'bg-slate-900 text-white border-slate-900 font-bold'
                            : isDark
                            ? 'bg-[#161920] border-[#272d38] text-slate-400 hover:text-white hover:border-slate-600'
                            : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {tier.title} ({tier.calories} kcal)
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 12-Week Weight Projection Line Chart Component */}
            <div className="pt-2">
              <WeightProjectionChart
                startingWeightKg={Number(inputs.weightKg) || 70}
                activeTier={activeTier}
                allTiers={result.allTiers}
                theme={theme}
                unitSystem={unitSystem}
                targetWeightKg={inputs.targetWeightKg}
              />
            </div>

            {/* Action Buttons */}
            <div
              className={`pt-4 border-t flex flex-wrap items-center justify-between gap-3 ${
                isDark ? 'border-[#1f242d]' : 'border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onScanFoodShortcut}
                  className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer hover:opacity-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scan Food with AI</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSetDailyTarget(activeTier.calories, activeTier.title)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-[#181b22] border-[#292f3b] text-slate-300 hover:text-white hover:border-slate-500'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5 text-teal-500" />
                  <span>Log Target</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onShareLink}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                  isDark
                    ? 'bg-[#181b22] border-[#292f3b] text-slate-300 hover:text-white hover:border-slate-500'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {shareCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Results</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-3xl p-12 text-center border ${
              isDark ? 'bg-[#101216] border-[#1f242d] text-slate-500' : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            Please enter your age, height, and weight to calculate your personalized targets.
          </div>
        )}
      </div>
    </section>
  );
};
