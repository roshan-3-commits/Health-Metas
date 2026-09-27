import React, { useState } from 'react';
import { LoggedMeal, MealCategory, StreakData, ThemeMode, LoggedExercise } from '../types';
import { StreakTracker } from './StreakTracker';
import { getAutoMealCategory } from '../utils/streak';
import {
  Utensils,
  Flame,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  Target,
  Sparkles,
  PieChart,
  ScanLine,
  Sunrise,
  Sun,
  Sunset,
  Coffee,
  Dumbbell,
  Activity,
} from 'lucide-react';

interface DailyTrackerProps {
  theme?: ThemeMode;
  targetCalories: number;
  targetLabel: string;
  meals: LoggedMeal[];
  streakData: StreakData;
  exercises?: LoggedExercise[];
  onUpdateStreak: (updated: StreakData) => void;
  onAddManualMeal: (meal: Omit<LoggedMeal, 'id' | 'time' | 'source'>) => void;
  onRemoveMeal: (id: string) => void;
  onClearAll: () => void;
  onSetCustomTarget: (target: number) => void;
  onOpenScanner: () => void;
  onGoToExercise?: () => void;
}

export const DailyTracker: React.FC<DailyTrackerProps> = ({
  theme = 'dark',
  targetCalories,
  targetLabel,
  meals,
  streakData,
  exercises = [],
  onUpdateStreak,
  onAddManualMeal,
  onRemoveMeal,
  onClearAll,
  onSetCustomTarget,
  onOpenScanner,
  onGoToExercise,
}) => {
  const isDark = theme === 'dark';
  const [quickName, setQuickName] = useState('');
  const [quickCalories, setQuickCalories] = useState<number | ''>('');
  const [quickProtein, setQuickProtein] = useState<number | ''>('');
  const [quickCarbs, setQuickCarbs] = useState<number | ''>('');
  const [quickFat, setQuickFat] = useState<number | ''>('');
  const [quickCategory, setQuickCategory] = useState<MealCategory>(() => getAutoMealCategory());
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [customTargetInput, setCustomTargetInput] = useState<number>(targetCalories);

  // Totals
  const totalCalories = meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = meals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = meals.reduce((acc, m) => acc + m.fat, 0);
  const totalBurned = exercises.reduce((acc, ex) => acc + ex.caloriesBurned, 0);
  const netCalories = Math.max(0, totalCalories - totalBurned);

  const remainingCalories = targetCalories - netCalories;
  const progressPercent = Math.min(100, Math.round((netCalories / (targetCalories || 2000)) * 100));

  const handleOpenAddModal = (presetCategory?: MealCategory) => {
    if (presetCategory) {
      setQuickCategory(presetCategory);
    } else {
      setQuickCategory(getAutoMealCategory());
    }
    setIsAddingCustom(true);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName || !quickCalories) return;

    onAddManualMeal({
      name: quickName,
      calories: Number(quickCalories),
      protein: Number(quickProtein) || 0,
      carbs: Number(quickCarbs) || 0,
      fat: Number(quickFat) || 0,
      category: quickCategory,
    });

    setQuickName('');
    setQuickCalories('');
    setQuickProtein('');
    setQuickCarbs('');
    setQuickFat('');
    setIsAddingCustom(false);
  };

  const handleSaveTarget = () => {
    if (customTargetInput && customTargetInput > 500) {
      onSetCustomTarget(customTargetInput);
      setIsEditingTarget(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span
            className={`text-xs uppercase tracking-widest font-bold block ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            DAILY NUTRITION LOG &amp; STREAK
          </span>
          <h1
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Daily Calorie, Macro &amp; Streak Center
          </h1>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Track your meals in real-time by Breakfast, Lunch, Snack, and Dinner to protect your consecutive logging streak.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onGoToExercise && (
            <button
              type="button"
              onClick={onGoToExercise}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
              <span>Easy Workouts</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenScanner}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>AI Food Scanner</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500 text-white hover:bg-blue-600 transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Item</span>
          </button>
        </div>
      </div>

      {/* Main Calories Progress Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border space-y-6 ${
          isDark ? 'bg-[#101216] border-[#1f242d] text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Daily Calorie Target
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {targetLabel}
              </span>
            </div>

            {isEditingTarget ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  value={customTargetInput}
                  onChange={(e) => setCustomTargetInput(Number(e.target.value))}
                  className={`w-32 px-3 py-1.5 rounded-xl border text-lg font-black focus:outline-none ${
                    isDark ? 'bg-[#161920] border-[#272d38] text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleSaveTarget}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTarget(false)}
                  className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black">{targetCalories}</span>
                <span className="text-xs text-slate-400 font-semibold uppercase">kcal / day</span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomTargetInput(targetCalories);
                    setIsEditingTarget(true);
                  }}
                  className="text-xs text-blue-400 hover:underline ml-2"
                >
                  Edit Target
                </button>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <div>
              <span className="text-xs font-bold text-slate-400 block">Consumed</span>
              <span className="text-2xl font-black text-emerald-400">{totalCalories}</span>
              <span className="text-[10px] text-slate-400 block">kcal</span>
            </div>

            {totalBurned > 0 && (
              <>
                <div className="w-px h-8 bg-slate-200/20" />
                <div>
                  <span className="text-xs font-bold text-slate-400 block">Workout Burned</span>
                  <span className="text-2xl font-black text-cyan-400">-{totalBurned}</span>
                  <span className="text-[10px] text-slate-400 block">kcal</span>
                </div>
              </>
            )}

            <div className="w-px h-8 bg-slate-200/20" />

            <div>
              <span className="text-xs font-bold text-slate-400 block">
                {totalBurned > 0 ? 'Net Remaining' : 'Remaining'}
              </span>
              <span
                className={`text-2xl font-black ${
                  remainingCalories >= 0 ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                {remainingCalories >= 0 ? remainingCalories : Math.abs(remainingCalories)}
              </span>
              <span className="text-[10px] text-slate-400 block">
                {remainingCalories >= 0 ? 'kcal left' : 'kcal over'}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-3 rounded-full bg-slate-800/40 overflow-hidden relative">
            <div
              style={{ width: `${progressPercent}%` }}
              className={`h-full transition-all duration-500 ${
                progressPercent > 100
                  ? 'bg-rose-500'
                  : progressPercent >= 90
                  ? 'bg-emerald-400'
                  : 'bg-blue-500'
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{progressPercent}% of target reached</span>
            <span>{meals.length} item{meals.length === 1 ? '' : 's'} logged today</span>
          </div>
        </div>

        {/* Macronutrient Summary Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className={`p-3.5 rounded-2xl border text-center ${isDark ? 'bg-[#15181f] border-[#252b36]' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-xs font-bold text-blue-400 block">Total Protein</span>
            <span className="text-xl font-black">{totalProtein}g</span>
            <span className={`text-[10px] block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {totalProtein * 4} kcal
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border text-center ${isDark ? 'bg-[#15181f] border-[#252b36]' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-xs font-bold text-purple-400 block">Total Carbs</span>
            <span className="text-xl font-black">{totalCarbs}g</span>
            <span className={`text-[10px] block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {totalCarbs * 4} kcal
            </span>
          </div>

          <div className={`p-3.5 rounded-2xl border text-center ${isDark ? 'bg-[#15181f] border-[#252b36]' : 'bg-slate-50 border-slate-200'}`}>
            <span className="text-xs font-bold text-amber-400 block">Total Fat</span>
            <span className="text-xl font-black">{totalFat}g</span>
            <span className={`text-[10px] block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {totalFat * 9} kcal
            </span>
          </div>
        </div>
      </div>

      {/* Quick Exercise & Movement Banner */}
      {onGoToExercise && (
        <div
          className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
            isDark
              ? 'bg-[#0e131d] border-white/10'
              : 'bg-emerald-50/70 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Daily Workouts &amp; Activities
              </h4>
              <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {totalCalories > 0
                  ? `Balance today's ${totalCalories} kcal with an easy walk, quick home workout, or stretch.`
                  : 'Explore simple, easy workouts to stay active and burn extra calories.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoToExercise}
            className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>View Workouts</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Comprehensive Streak & Real-Time Meal Scheduler Section */}
      <div id="streak-section" className="scroll-mt-20">
        <StreakTracker
          streakData={streakData}
          onUpdateStreak={onUpdateStreak}
          theme={theme}
          targetCalories={targetCalories}
          meals={meals}
          onOpenScanner={onOpenScanner}
          onOpenAddModal={handleOpenAddModal}
          onRemoveMeal={onRemoveMeal}
          onClearMeals={onClearAll}
        />
      </div>

      {/* Add Custom Meal Drawer */}
      {isAddingCustom && (
        <form
          onSubmit={handleQuickAdd}
          className={`p-6 rounded-3xl border space-y-4 animate-fadeIn ${
            isDark ? 'bg-[#101216] border-[#1f242d] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Log Food Entry to Daily Streak</h3>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {/* Meal Timing Slot Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Meal Slot:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'breakfast' as MealCategory, label: 'Breakfast', icon: Sunrise },
                { id: 'lunch' as MealCategory, label: 'Lunch', icon: Sun },
                { id: 'snack' as MealCategory, label: 'Snack', icon: Coffee },
                { id: 'dinner' as MealCategory, label: 'Dinner', icon: Sunset },
              ].map((slot) => {
                const isSelected = quickCategory === slot.id;
                const IconComp = slot.icon;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setQuickCategory(slot.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-amber-500 text-slate-950 font-black border-amber-400 shadow-md'
                          : 'bg-amber-500 text-slate-950 font-black border-amber-500'
                        : isDark
                        ? 'bg-[#151920] border-[#252b36] text-slate-400'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{slot.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Meal name (e.g. Oats with Peanut Butter, Dal Roti)"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
                isDark ? 'bg-[#161920] border-[#272d38] text-white' : 'bg-slate-50 border-slate-200'
              }`}
            />
            <input
              type="number"
              required
              placeholder="Calories (kcal)"
              value={quickCalories}
              onChange={(e) => setQuickCalories(e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full px-4 py-2.5 rounded-xl border text-xs font-medium focus:outline-none ${
                isDark ? 'bg-[#161920] border-[#272d38] text-white' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              placeholder="Protein (g)"
              value={quickProtein}
              onChange={(e) => setQuickProtein(e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full px-4 py-2 rounded-xl border text-xs font-medium focus:outline-none ${
                isDark ? 'bg-[#161920] border-[#272d38] text-white' : 'bg-slate-50 border-slate-200'
              }`}
            />
            <input
              type="number"
              placeholder="Carbs (g)"
              value={quickCarbs}
              onChange={(e) => setQuickCarbs(e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full px-4 py-2 rounded-xl border text-xs font-medium focus:outline-none ${
                isDark ? 'bg-[#161920] border-[#272d38] text-white' : 'bg-slate-50 border-slate-200'
              }`}
            />
            <input
              type="number"
              placeholder="Fat (g)"
              value={quickFat}
              onChange={(e) => setQuickFat(e.target.value === '' ? '' : Number(e.target.value))}
              className={`w-full px-4 py-2 rounded-xl border text-xs font-medium focus:outline-none ${
                isDark ? 'bg-[#161920] border-[#272d38] text-white' : 'bg-slate-50 border-slate-200'
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xs transition cursor-pointer shadow-md"
          >
            Log to {quickCategory.toUpperCase()} &amp; Save to Streak
          </button>
        </form>
      )}

      {/* Meals List */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border space-y-4 ${
          isDark ? 'bg-[#101216] border-[#1f242d] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">All Logged Food Entries Today ({meals.length})</h3>
          {meals.length > 0 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-rose-400 hover:underline cursor-pointer"
            >
              Clear All Entries
            </button>
          )}
        </div>

        {meals.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Utensils className="w-8 h-8 text-slate-500 mx-auto" />
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No food entries logged for today yet. Use the <strong>AI Scanner</strong> or quick log to track your meals and continue your streak!
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={onOpenScanner}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition"
              >
                Open AI Food Scanner
              </button>
              <button
                type="button"
                onClick={() => handleOpenAddModal()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                Add Manual Item
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDark ? 'bg-[#15181f] border-[#242b36]' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm">{meal.name}</span>
                    {meal.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize">
                        {meal.category}
                      </span>
                    )}
                    {meal.source === 'scanner' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 font-bold">
                        AI Scanned
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="font-extrabold text-amber-400">{meal.calories} kcal</span>
                    <span>•</span>
                    <span>P: {meal.protein}g</span>
                    <span>•</span>
                    <span>C: {meal.carbs}g</span>
                    <span>•</span>
                    <span>F: {meal.fat}g</span>
                    <span>•</span>
                    <span>{meal.time}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveMeal(meal.id)}
                  className="p-2 text-slate-400 hover:text-rose-400 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
