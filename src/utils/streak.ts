import { MealCategory, StreakData } from '../types';

const STREAK_STORAGE_KEY = 'healthmeta_streak_data';

function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadStreakData(): StreakData {
  const fallback: StreakData = {
    currentStreak: 1,
    longestStreak: 3,
    lastLoggedDate: getTodayStr(),
    loggedDates: [getTodayStr()],
    freezeTokens: 2,
    totalDaysLogged: 1,
    history: [
      {
        date: getTodayStr(),
        calories: 420,
        mealsCount: 1,
      },
    ],
  };

  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      ...fallback,
      ...parsed,
    };
  } catch {
    return fallback;
  }
}

export function saveStreakData(streakData: StreakData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streakData));
  } catch (err) {
    console.warn('Failed to save streak data:', err);
  }
}

export function recordMealLogToStreak(
  streakData: StreakData,
  calories: number
): { updatedData: StreakData; streakIncreased: boolean } {
  const today = getTodayStr();
  const yesterday = getYesterdayStr();

  const loggedDates = streakData.loggedDates || [];
  const alreadyLoggedToday = loggedDates.includes(today);

  let newCurrentStreak = streakData.currentStreak || 0;
  let newLongestStreak = streakData.longestStreak || 0;
  let streakIncreased = false;

  if (!alreadyLoggedToday) {
    if (streakData.lastLoggedDate === yesterday) {
      newCurrentStreak += 1;
      streakIncreased = true;
    } else if (streakData.lastLoggedDate === today) {
      // already counted
    } else {
      // missed more than 1 day
      newCurrentStreak = 1;
      streakIncreased = true;
    }
  }

  if (newCurrentStreak > newLongestStreak) {
    newLongestStreak = newCurrentStreak;
  }

  const newLoggedDates = alreadyLoggedToday ? loggedDates : [...loggedDates, today];
  const history = [...(streakData.history || [])];
  const existingDayIdx = history.findIndex((h) => h.date === today);

  if (existingDayIdx >= 0) {
    history[existingDayIdx] = {
      ...history[existingDayIdx],
      calories: history[existingDayIdx].calories + calories,
      mealsCount: history[existingDayIdx].mealsCount + 1,
    };
  } else {
    history.unshift({
      date: today,
      calories,
      mealsCount: 1,
    });
  }

  const updatedData: StreakData = {
    ...streakData,
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastLoggedDate: today,
    loggedDates: newLoggedDates,
    totalDaysLogged: newLoggedDates.length,
    history: history.slice(0, 30),
  };

  return { updatedData, streakIncreased };
}

export function getAutoMealCategory(): MealCategory {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 19) return 'snack';
  return 'dinner';
}
