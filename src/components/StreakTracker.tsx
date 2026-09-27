import React from 'react';
import { LoggedMeal, MealCategory, StreakData, ThemeMode } from '../types';
import {
  Flame,
  Award,
  Shield,
  Plus,
  Trash2,
  ScanLine,
  Sunrise,
  Sun,
  Sunset,
  Coffee,
  CheckCircle2,
} from 'lucide-react';

interface StreakTrackerProps {
  streakData: StreakData;
  onUpdateStreak: (updated: StreakData) => void;
  theme?: ThemeMode;
  targetCalories: number;
  meals: LoggedMeal[];
  onOpenScanner: () => void;
  onOpenAddModal: (category?: MealCategory) => void;
  onRemoveMeal: (id: string) => void;
  onClearMeals: () => void;
}

const MEAL_SLOTS: { id: MealCategory; label: string; timeDesc: string; icon: any }[] = [
  { id: 'breakfast', label: 'Breakfast', timeDesc: '07:30 - 09:30 AM', icon: Sunrise },
  { id: 'lunch', label: 'Lunch', timeDesc: '12:30 - 02:30 PM', icon: Sun },
  { id: 'snack', label: 'Afternoon Snack', timeDesc: '04:30 - 06:00 PM', icon: Coffee },
  { id: 'dinner', label: 'Dinner', timeDesc: '07:30 - 09:30 PM', icon: Sunset },
];

export const StreakTracker: React.FC<StreakTrackerProps> = ({
  streakData,
  onUpdateStreak,
  theme = 'dark',
  meals,
  onOpenScanner,
  onOpenAddModal,
  onRemoveMeal,
  onClearMeals,
}) => {
  const isDark = theme === 'dark';

  // Last 7 days calendar view
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayName = d.toLocaleDateString([], { weekday: 'narrow' });
    const isToday = i === 6;
    const isLogged = (streakData.loggedDates || []).includes(dateStr);

    return {
      dateStr,
      dayName,
      dayNumber: d.getDate(),
      isToday,
      isLogged,
    };
  });

  const handleUseFreeze = () => {
    if (streakData.freezeTokens > 0) {
      onUpdateStreak({
        ...streakData,
        freezeTokens: streakData.freezeTokens - 1,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Streak Dashboard Card */}
      <div
        className={`p-6 rounded-3xl border ${
          isDark
            ? 'bg-gradient-to-br from-[#151922] to-[#0d1017] border-[#202736] text-white'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Flame className="w-6 h-6 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black">{streakData.currentStreak} Day Streak</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                  Active
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Log your nutrition every day to build lasting metabolic momentum.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-3.5 py-2 rounded-2xl border text-center ${
                isDark ? 'bg-[#181d28] border-[#293244]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>Longest</span>
              </div>
              <span className="text-base font-black">{streakData.longestStreak} Days</span>
            </div>

            <div
              className={`px-3.5 py-2 rounded-2xl border text-center ${
                isDark ? 'bg-[#181d28] border-[#293244]' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>Freezes</span>
              </div>
              <span className="text-base font-black">{streakData.freezeTokens} Left</span>
            </div>
          </div>
        </div>

        {/* 7-Day Dots View */}
        <div className="mt-6 pt-5 border-t border-slate-800/40 flex items-center justify-between gap-1 max-w-md mx-auto">
          {last7Days.map((day) => (
            <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
              <span className={`text-[10px] font-bold ${day.isToday ? 'text-amber-400' : 'text-slate-400'}`}>
                {day.dayName}
              </span>
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs transition border ${
                  day.isLogged
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                    : day.isToday
                    ? isDark
                      ? 'bg-[#1f2533] border-amber-500/50 text-white'
                      : 'bg-slate-100 border-amber-400 text-slate-800'
                    : isDark
                    ? 'bg-[#151922] border-[#252c3d] text-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                {day.isLogged ? <CheckCircle2 className="w-4 h-4 fill-current" /> : day.dayNumber}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Circadian Meal Schedule Slots Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Circadian Meal Slots &amp; Logged Food
          </h4>
          {meals.length > 0 && (
            <button
              type="button"
              onClick={onClearMeals}
              className="text-xs text-red-400 hover:text-red-300 transition"
            >
              Clear Today's Meals
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MEAL_SLOTS.map((slot) => {
            const slotMeals = meals.filter((m) => {
              if (m.category) return m.category === slot.id;
              // Fallback based on text match or default
              const nameLower = m.name.toLowerCase();
              if (slot.id === 'breakfast' && (nameLower.includes('toast') || nameLower.includes('egg') || nameLower.includes('poha') || nameLower.includes('idli'))) return true;
              if (slot.id === 'lunch' && (nameLower.includes('rice') || nameLower.includes('dal') || nameLower.includes('salad'))) return true;
              if (slot.id === 'snack' && (nameLower.includes('samosa') || nameLower.includes('tea') || nameLower.includes('fruit'))) return true;
              if (slot.id === 'dinner') return true;
              return false;
            });

            const slotCalories = slotMeals.reduce((sum, m) => sum + m.calories, 0);
            const IconComp = slot.icon;

            return (
              <div
                key={slot.id}
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between space-y-3 ${
                  isDark ? 'bg-[#12151c] border-[#202531] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm leading-tight">{slot.label}</h5>
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {slot.timeDesc}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                    {slotCalories} kcal
                  </span>
                </div>

                {/* Meals list in this slot */}
                <div className="space-y-2 min-h-[40px]">
                  {slotMeals.length > 0 ? (
                    slotMeals.map((m) => (
                      <div
                        key={m.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          isDark ? 'bg-[#171b24] border-[#272f3e]' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold block truncate">{m.name}</span>
                          <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {m.calories} kcal • P: {m.protein}g C: {m.carbs}g F: {m.fat}g
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveMeal(m.id)}
                          className="text-slate-400 hover:text-red-400 p-1 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center text-xs text-slate-500 italic">
                      No meals logged yet in this window.
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/30">
                  <button
                    type="button"
                    onClick={() => onOpenAddModal(slot.id)}
                    className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isDark
                        ? 'bg-[#171b24] border-[#293242] text-slate-300 hover:text-white hover:border-slate-500'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Item</span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenScanner}
                    className="p-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                    title="Scan Food with AI"
                  >
                    <ScanLine className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
