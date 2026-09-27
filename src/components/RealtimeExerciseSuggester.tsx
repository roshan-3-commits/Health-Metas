import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Dumbbell,
  Flame,
  Clock,
  Zap,
  CheckCircle2,
  RotateCcw,
  Play,
  Pause,
  Footprints,
  Heart,
  Plus,
  X,
  Smile,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ExerciseRecommendation, LoggedMeal, PrimaryGoal, ThemeMode, LoggedExercise } from '../types';
import { getRealtimeExerciseSuggestions, calculateCaloriesBurned } from '../utils/exerciseEngine';

interface RealtimeExerciseSuggesterProps {
  weightKg?: number;
  goal?: PrimaryGoal | string;
  totalCaloriesLoggedToday?: number;
  targetCalories?: number;
  mealsLogged?: LoggedMeal[];
  theme?: ThemeMode;
  onLogExercise?: (exercise: LoggedExercise) => void;
  onGoToTracker?: () => void;
}

export const RealtimeExerciseSuggester: React.FC<RealtimeExerciseSuggesterProps> = ({
  weightKg = 70,
  goal = 'lose',
  totalCaloriesLoggedToday = 0,
  targetCalories = 2000,
  mealsLogged = [],
  theme = 'dark',
  onLogExercise,
  onGoToTracker,
}) => {
  const isDark = theme === 'dark';
  const safeGoal: PrimaryGoal =
    goal === 'gain' ? 'gain' : goal === 'maintain' ? 'maintain' : 'lose';

  const userWeight = weightKg > 30 ? weightKg : 70;

  // Simple clean category tabs: All, Walking, Home, Cardio, Strength
  const [activeFilter, setActiveFilter] = useState<'all' | 'walking' | 'home' | 'cardio' | 'strength'>('all');
  const [loggedExerciseIds, setLoggedExerciseIds] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Selected duration per exercise (default to 20 or 30 mins)
  const [customDurations, setCustomDurations] = useState<Record<string, number>>({});

  // Active workout timer
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Custom Workout Modal
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('Cricket / Badminton');
  const [customMinutes, setCustomMinutes] = useState<number>(30);
  const [customCalories, setCustomCalories] = useState<number>(150);

  // Success toast
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);

  // Exercise suggestions from engine
  const { recommendations } = useMemo(() => {
    return getRealtimeExerciseSuggestions({
      weightKg: userWeight,
      goal: safeGoal,
      totalCaloriesLoggedToday,
      targetCalories,
      mealsLogged,
      currentTime: new Date(),
    });
  }, [userWeight, safeGoal, totalCaloriesLoggedToday, targetCalories, mealsLogged]);

  // Clean 6 core exercises (no duplicates or confusing mixups)
  const displayExercises = useMemo(() => {
    if (activeFilter === 'walking') {
      return recommendations.filter((r) => r.category === 'walking');
    }
    if (activeFilter === 'home') {
      return recommendations.filter((r) => r.category === 'home_burner');
    }
    if (activeFilter === 'cardio') {
      return recommendations.filter((r) => r.category === 'cardio');
    }
    if (activeFilter === 'strength') {
      return recommendations.filter((r) => r.category === 'strength' || r.category === 'mobility');
    }
    return recommendations;
  }, [recommendations, activeFilter]);

  // Timer runner
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsRemaining > 0) {
      interval = setInterval(() => {
        setTimerSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsRemaining]);

  const handleStartTimer = (ex: ExerciseRecommendation, mins: number) => {
    setActiveTimerId(ex.id);
    setTimerSecondsRemaining(mins * 60);
    setIsTimerRunning(true);
  };

  const handleResetTimer = (mins: number) => {
    setIsTimerRunning(false);
    setTimerSecondsRemaining(mins * 60);
  };

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLog = (ex: ExerciseRecommendation, mins: number) => {
    const burned = calculateCaloriesBurned(ex.met, userWeight, mins);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const logged: LoggedExercise = {
      id: `ex_${Date.now()}`,
      name: ex.name,
      durationMinutes: mins,
      caloriesBurned: burned,
      time: timeStr,
      category: ex.categoryLabel,
      timestamp: Date.now(),
    };

    setLoggedExerciseIds((prev) => ({ ...prev, [ex.id]: true }));
    setToastMessage({
      title: 'Done! 🎉',
      subtitle: `${ex.name} (${mins} min) - ${burned} kcal burned!`,
    });
    setTimeout(() => setToastMessage(null), 3000);

    if (onLogExercise) {
      onLogExercise(logged);
    }
  };

  const handleLogCustomWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const logged: LoggedExercise = {
      id: `custom_ex_${Date.now()}`,
      name: customName.trim(),
      durationMinutes: Number(customMinutes) || 30,
      caloriesBurned: Number(customCalories) || 150,
      time: timeStr,
      category: 'Custom Sport',
      timestamp: Date.now(),
    };

    if (onLogExercise) {
      onLogExercise(logged);
    }

    setShowCustomModal(false);
    setToastMessage({
      title: 'Activity Logged! 🏃',
      subtitle: `${customName}: -${customCalories} kcal added to daily burn!`,
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getExerciseIcon = (category: string) => {
    switch (category) {
      case 'walking':
        return <Footprints className="w-5 h-5 text-emerald-400" />;
      case 'home_burner':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'cardio':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'strength':
        return <Dumbbell className="w-5 h-5 text-purple-400" />;
      default:
        return <Heart className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-20 right-4 z-50 p-3.5 rounded-2xl bg-emerald-500 text-slate-950 font-bold flex items-center gap-3 shadow-xl border border-emerald-300"
          >
            <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
            <div className="text-xs">
              <p className="font-black text-sm">{toastMessage.title}</p>
              <p className="text-slate-900 font-semibold">{toastMessage.subtitle}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Header Bar */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition ${
          isDark
            ? 'bg-[#10141f] border-white/10'
            : 'bg-white border-slate-200 shadow-2xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400">
                Simple &amp; Easy
              </span>
              <span className="text-xs text-slate-400">Daily Exercise</span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Daily Workouts &amp; Activities
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Pick an easy exercise to burn calories and feel refreshed. No complicated gym setup needed!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowCustomModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Log Sport / Game</span>
            </button>

            {onGoToTracker && (
              <button
                type="button"
                onClick={onGoToTracker}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  isDark
                    ? 'border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span>Tracker</span>
                <span className="ml-1">→</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Simple Category Tabs (Clear & Not Overwhelming) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all' as const, label: 'All', icon: <Smile className="w-3.5 h-3.5" /> },
          { id: 'walking' as const, label: 'Walking', icon: <Footprints className="w-3.5 h-3.5" /> },
          { id: 'home' as const, label: 'Home Workout', icon: <Zap className="w-3.5 h-3.5" /> },
          { id: 'cardio' as const, label: 'Cardio & Jog', icon: <Flame className="w-3.5 h-3.5" /> },
          { id: 'strength' as const, label: 'Strength & Stretch', icon: <Dumbbell className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-emerald-400 text-slate-950 font-black shadow-xs'
                : isDark
                ? 'bg-[#121622] text-slate-400 hover:text-white border border-white/5'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Clear List of Exercises (Clean Single Column for Zero Confusion) */}
      <div className="space-y-3">
        {displayExercises.map((ex) => {
          const isLogged = loggedExerciseIds[ex.id];
          const isTimerActive = activeTimerId === ex.id;
          const isExpanded = expandedId === ex.id;

          const selectedMins = customDurations[ex.id] || ex.durationMinutes;
          const currentBurn = calculateCaloriesBurned(ex.met, userWeight, selectedMins);

          return (
            <div
              key={ex.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-[#10141f] border-white/10 hover:border-emerald-500/30'
                  : 'bg-white border-slate-200 hover:border-emerald-400 shadow-2xs'
              }`}
            >
              {/* Row 1: Icon, Title, Calorie Burn Badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isDark ? 'bg-white/5' : 'bg-slate-100'
                    }`}
                  >
                    {getExerciseIcon(ex.category)}
                  </div>
                  <div>
                    <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {ex.name}
                    </h3>
                    <p className={`text-xs line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {ex.reason}
                    </p>
                  </div>
                </div>

                {/* Calorie Burn Highlight */}
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1 text-sm sm:text-base font-black text-amber-400">
                    <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>~{currentBurn} kcal</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">for {selectedMins} min</span>
                </div>
              </div>

              {/* Row 2: Duration Selector + Actions */}
              <div className="mt-3.5 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                {/* Duration Pills */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 mr-1">Time:</span>
                  {[15, 20, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setCustomDurations((prev) => ({ ...prev, [ex.id]: mins }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedMins === mins
                          ? 'bg-emerald-400 text-slate-950 font-black'
                          : isDark
                          ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>

                {/* Actions: Timer + Done Button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                    className="text-xs text-slate-400 hover:text-white px-2 py-1 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide' : 'Tips'}</span>
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {!isTimerActive ? (
                    <button
                      type="button"
                      onClick={() => handleStartTimer(ex, selectedMins)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                        isDark
                          ? 'border-white/10 hover:border-white/25 text-slate-300'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      <Play className="w-3 h-3 text-emerald-400" />
                      <span>Timer</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleLog(ex, selectedMins)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isLogged
                        ? 'bg-emerald-600 text-white font-black'
                        : 'bg-emerald-400 text-slate-950 font-black hover:bg-emerald-300'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isLogged ? 'Logged ✓' : 'I Did This'}</span>
                  </button>
                </div>
              </div>

              {/* Active Timer Box if running */}
              {isTimerActive && (
                <div
                  className={`mt-3 p-3 rounded-xl border flex items-center justify-between ${
                    isDark ? 'bg-black/40 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-sm font-black tracking-widest text-emerald-400">
                      {formatTimer(timerSecondsRemaining)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsTimerRunning((prev) => !prev)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-1 cursor-pointer"
                    >
                      {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                      <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResetTimer(selectedMins)}
                      className="p-1 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                      title="Reset"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Simple Step-by-Step Guidance */}
              {isExpanded && (
                <div
                  className={`mt-3 pt-3 border-t text-xs space-y-1.5 ${
                    isDark ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  <p className="font-bold text-[11px] text-slate-400">How to do it:</p>
                  <ul className="space-y-1">
                    {ex.instructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Sport / Workout Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-sm p-5 rounded-2xl border shadow-2xl space-y-3.5 ${
              isDark ? 'bg-[#10141f] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black">Log Your Activity</h3>
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogCustomWorkout} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold block mb-1 text-slate-300">Activity / Sport</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Cricket, Badminton, Swimming, Gym..."
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                    isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold block mb-1 text-slate-300">Minutes</label>
                  <input
                    type="number"
                    min="5"
                    max="240"
                    value={customMinutes}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setCustomMinutes(m);
                      setCustomCalories(Math.round(m * 5));
                    }}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                      isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold block mb-1 text-slate-300">Calories (kcal)</label>
                  <input
                    type="number"
                    min="10"
                    max="2000"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-1 focus:ring-emerald-400 ${
                      isDark ? 'bg-black/40 border-white/15 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                    required
                  />
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="pt-1 flex flex-wrap gap-1.5">
                {['Badminton (30m)', 'Cricket (45m)', 'Swimming (30m)', 'Dancing (20m)'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      const name = p.split(' (')[0];
                      const mins = parseInt(p.split('(')[1]);
                      setCustomName(name);
                      setCustomMinutes(mins);
                      setCustomCalories(mins * 5);
                    }}
                    className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-black bg-emerald-400 text-slate-950 hover:bg-emerald-300 cursor-pointer"
                >
                  Save Workout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
