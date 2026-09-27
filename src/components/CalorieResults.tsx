import React, { useState } from 'react';
import { CalculationResult, GoalCalorieTier } from '../types';
import { WeightProjectionChart } from './WeightProjectionChart';
import {
  Flame,
  Activity,
  Droplets,
  Scale,
  Sparkles,
  PieChart,
  Calendar,
  Share2,
  Check,
  Printer,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Info,
} from 'lucide-react';

interface CalorieResultsProps {
  result: CalculationResult;
  onSetDailyTarget: (calories: number, label: string) => void;
  onScanFoodShortcut: () => void;
  onShareLink?: () => void;
  shareCopied?: boolean;
}

export const CalorieResults: React.FC<CalorieResultsProps> = ({
  result,
  onSetDailyTarget,
  onScanFoodShortcut,
  onShareLink,
  shareCopied,
}) => {
  const [selectedTierId, setSelectedTierId] = useState<string>(result.activeGoalTier.id);

  // Determine active displayed tier
  const allTiers = [...result.weightLossTiers, result.maintenanceTier, ...result.weightGainTiers];
  const activeTier = allTiers.find((t) => t.id === selectedTierId) || result.activeGoalTier;

  const handleSelectTier = (tier: GoalCalorieTier) => {
    setSelectedTierId(tier.id);
    onSetDailyTarget(tier.calories, tier.title);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="calorie-results-section" className="space-y-6 animate-fadeIn">
      {/* 1. Primary Highlight Card: Active Calorie Target */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-md border border-white/10">
              <Flame className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              <span>Recommended Daily Energy Target</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {activeTier.title}
            </h3>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl leading-relaxed">
              {activeTier.timeframeDescription} ({activeTier.paceDescription})
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
                {activeTier.calories.toLocaleString()}
              </span>
              <span className="text-base sm:text-lg font-bold text-emerald-300">kcal / day</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200">
                {activeTier.diff === 0
                  ? 'Maintenance baseline'
                  : activeTier.diff < 0
                  ? `${activeTier.diff} kcal deficit`
                  : `+${activeTier.diff} kcal surplus`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar inside banner */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onScanFoodShortcut}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scan Food with AI</span>
            </button>

            {onShareLink && (
              <button
                type="button"
                onClick={onShareLink}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition border border-white/15 flex items-center gap-1.5 cursor-pointer"
              >
                {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{shareCopied ? 'Link Copied!' : 'Share Results'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="text-xs text-emerald-200/80 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* 2. Metabolic Anchors (BMR & TDEE) & Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* BMR Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Basal Metabolism (BMR)</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{result.bmr}</span>
            <span className="text-xs font-bold text-slate-500">kcal/day</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Energy required at complete coma-level resting state.
          </p>
        </div>

        {/* TDEE Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Maintenance (TDEE)</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{result.tdee}</span>
            <span className="text-xs font-bold text-slate-500">kcal/day</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Total daily burn factoring your physical activity.
          </p>
        </div>

        {/* BMI & Ideal Weight Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Body Mass Index (BMI)</span>
            <Scale className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{result.bmi}</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              {result.bmiCategory}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Ideal normal range: {result.idealWeightRange.min} – {result.idealWeightRange.max} kg
          </p>
        </div>

        {/* Hydration Target Card */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Daily Water Target</span>
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{result.waterIntakeLiters}</span>
            <span className="text-xs font-bold text-slate-500">Liters ({result.waterIntakeOz} oz)</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            35 ml/kg baseline + exercise hydration cofactor.
          </p>
        </div>
      </div>

      {/* 3. Goal Option Tiers (Deficit & Surplus Tiers) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div>
          <h4 className="text-base sm:text-lg font-bold text-slate-900">
            Compare Calorie Targets by Goal
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any tier below to view its personalized macronutrient breakdown.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Weight Loss Tiers */}
          {result.weightLossTiers.map((tier) => {
            const isSelected = selectedTierId === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => handleSelectTier(tier)}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                      {tier.title}
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                      {tier.diff} kcal
                    </span>
                  </div>
                  <div className="my-2">
                    <span className="text-2xl font-black text-slate-900">{tier.calories}</span>
                    <span className="text-xs font-medium text-slate-500 ml-1">kcal/day</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{tier.paceDescription}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-emerald-800 flex items-center justify-between">
                  <span>P: {tier.macros.proteinG}g • C: {tier.macros.carbsG}g • F: {tier.macros.fatG}g</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}

          {/* Maintenance Tier */}
          <div
            onClick={() => handleSelectTier(result.maintenanceTier)}
            className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
              selectedTierId === result.maintenanceTier.id
                ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-teal-600" />
                  {result.maintenanceTier.title}
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Maintain
                </span>
              </div>
              <div className="my-2">
                <span className="text-2xl font-black text-slate-900">{result.maintenanceTier.calories}</span>
                <span className="text-xs font-medium text-slate-500 ml-1">kcal/day</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">Stable weight equilibrium</p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-emerald-800 flex items-center justify-between">
              <span>P: {result.maintenanceTier.macros.proteinG}g • C: {result.maintenanceTier.macros.carbsG}g • F: {result.maintenanceTier.macros.fatG}g</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          {/* Lean Muscle Gain Tier */}
          {result.weightGainTiers.slice(0, 2).map((tier) => {
            const isSelected = selectedTierId === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => handleSelectTier(tier)}
                className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      {tier.title}
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                      +{tier.diff} kcal
                    </span>
                  </div>
                  <div className="my-2">
                    <span className="text-2xl font-black text-slate-900">{tier.calories}</span>
                    <span className="text-xs font-medium text-slate-500 ml-1">kcal/day</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{tier.paceDescription}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-emerald-800 flex items-center justify-between">
                  <span>P: {tier.macros.proteinG}g • C: {tier.macros.carbsG}g • F: {tier.macros.fatG}g</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Macronutrient Distribution Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-teal-100 text-teal-800">
                <PieChart className="w-4 h-4" />
              </span>
              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                Personalized Macronutrient Targets ({activeTier.title})
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Formulated to maximize muscle preservation during cuts and energy during maintenance.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl self-start sm:self-auto border border-emerald-200">
            Total: {activeTier.calories} kcal
          </span>
        </div>

        {/* Macro Progress Bar */}
        <div className="space-y-2">
          <div className="h-4 rounded-full overflow-hidden flex bg-slate-100">
            <div
              style={{ width: `${activeTier.macros.proteinPct}%` }}
              className="bg-amber-500 h-full transition-all"
              title={`Protein: ${activeTier.macros.proteinPct}%`}
            />
            <div
              style={{ width: `${activeTier.macros.carbsPct}%` }}
              className="bg-blue-500 h-full transition-all"
              title={`Carbs: ${activeTier.macros.carbsPct}%`}
            />
            <div
              style={{ width: `${activeTier.macros.fatPct}%` }}
              className="bg-emerald-600 h-full transition-all"
              title={`Fat: ${activeTier.macros.fatPct}%`}
            />
          </div>
          <div className="flex justify-between text-[11px] font-bold text-slate-500 px-1">
            <span className="text-amber-800">Protein ({activeTier.macros.proteinPct}%)</span>
            <span className="text-blue-800">Carbohydrates ({activeTier.macros.carbsPct}%)</span>
            <span className="text-emerald-800">Healthy Fats ({activeTier.macros.fatPct}%)</span>
          </div>
        </div>

        {/* Macro Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Protein */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase">Protein</span>
              <span className="text-xs font-bold text-amber-700">{activeTier.macros.proteinPct}%</span>
            </div>
            <div className="my-1.5 flex items-baseline gap-1">
              <span className="text-3xl font-black text-amber-950">{activeTier.macros.proteinG}</span>
              <span className="text-xs font-bold text-amber-800">grams / day</span>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">
              {activeTier.macros.proteinKcal} kcal (4 kcal/g)
            </span>
          </div>

          {/* Carbs */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase">Carbohydrates</span>
              <span className="text-xs font-bold text-blue-700">{activeTier.macros.carbsPct}%</span>
            </div>
            <div className="my-1.5 flex items-baseline gap-1">
              <span className="text-3xl font-black text-blue-950">{activeTier.macros.carbsG}</span>
              <span className="text-xs font-bold text-blue-800">grams / day</span>
            </div>
            <span className="text-[11px] text-blue-700 font-medium">
              {activeTier.macros.carbsKcal} kcal (4 kcal/g)
            </span>
          </div>

          {/* Fats */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase">Healthy Fats</span>
              <span className="text-xs font-bold text-emerald-700">{activeTier.macros.fatPct}%</span>
            </div>
            <div className="my-1.5 flex items-baseline gap-1">
              <span className="text-3xl font-black text-emerald-950">{activeTier.macros.fatG}</span>
              <span className="text-xs font-bold text-emerald-800">grams / day</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              {activeTier.macros.fatKcal} kcal (9 kcal/g)
            </span>
          </div>
        </div>

        {/* 12-Week Trajectory Line Chart */}
        <WeightProjectionChart
          startingWeightKg={result.idealWeightRange ? (result.idealWeightRange.min + result.idealWeightRange.max) / 2 : 70}
          activeTier={activeTier}
          allTiers={allTiers}
          theme="light"
          targetWeightKg=""
        />

        {/* Timeline Projector Card if calculated */}
        {result.timelineWeeks && result.timelineWeeks > 0 && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-emerald-700 shrink-0" />
            <div className="text-xs sm:text-sm text-slate-700">
              <span className="font-bold text-slate-900">Projected Goal Timeline:</span> Estimated{' '}
              <span className="font-extrabold text-emerald-800">{result.timelineWeeks} weeks</span> of consistent adherence to reach your target weight.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
