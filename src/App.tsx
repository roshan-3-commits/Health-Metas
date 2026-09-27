import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalculatorInputs,
  CalculationResult,
  LoggedMeal,
  MealCategory,
  NavPage,
  StreakData,
  ThemeMode,
  UserProfile,
  NotificationSettings,
  NotificationLog,
  LoggedExercise,
} from './types';
import {
  computeCalorieReport,
  parseInputsFromQuery,
  serializeInputsToQuery,
} from './utils/calculator';
import { loadStreakData, saveStreakData, recordMealLogToStreak, getAutoMealCategory } from './utils/streak';
import {
  loadUserProfile,
  saveUserProfile,
  loadNotificationSettings,
  saveNotificationSettings,
  loadNotificationLogs,
  saveNotificationLogs,
  syncProfileToCalculatorInputs,
  syncCalculatorInputsToProfile,
} from './utils/profileAndNotifications';
import { AnimatedBackground } from './components/AnimatedBackground';
import { useNotificationScheduler } from './utils/useNotificationScheduler';
import { signInWithGoogle, logOut, onAuthChange, User as FirebaseUser } from './lib/firebase';
import { dispatchWelcomeEmail } from './lib/welcomeEmail';
import { AuthModal } from './components/AuthModal';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CalculatorSection } from './components/CalculatorSection';
import { AIFoodScanner } from './components/AIFoodScanner';
import { DailyTracker } from './components/DailyTracker';
import { RealtimeExerciseSuggester } from './components/RealtimeExerciseSuggester';
import { UserProfilePage } from './components/UserProfilePage';
import { MethodologyPage } from './components/MethodologyPage';
import { AboutPage } from './components/AboutPage';
import { FAQPage } from './components/FAQPage';
import { PrivacyTermsPage } from './components/PrivacyTermsPage';
import { ContactPage } from './components/ContactPage';
import { ToastProvider, useToast } from './components/Toast';
import {
  Calculator,
  Lock,
  Share2,
  Sparkles,
  ShieldCheck,
  Zap,
  Flame,
  User,
  BellRing,
} from 'lucide-react';

const DEFAULT_INPUTS: CalculatorInputs = {
  age: 30,
  gender: 'male',
  heightCm: 175,
  weightKg: 70,
  activityLevel: 'sedentary',
  goal: 'maintain',
  targetWeightKg: '',
  formula: 'mifflin',
};

function MainAppContent() {
  const { toastCopy, toastMeal, toastSuccess, toastInfo, toastError } = useToast();
  const [activePage, setActivePage] = useState<NavPage>('calculator');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('healthmeta_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {
      console.warn(e);
    }
    return 'dark';
  });
  const [shareCopied, setShareCopied] = useState(false);

  // Apply dark mode class to root and body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    try {
      localStorage.setItem('healthmeta_theme', theme);
    } catch (e) {
      console.warn(e);
    }
  }, [theme]);

  // Initialize inputs from URL query params or defaults
  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      const parsed = parseInputsFromQuery(window.location.search);
      return { ...DEFAULT_INPUTS, ...parsed };
    }
    return DEFAULT_INPUTS;
  });

  // Calculate live report whenever inputs change
  const results = useMemo(() => computeCalorieReport(inputs), [inputs]);

  // Daily target state for the tracker
  const [dailyTarget, setDailyTarget] = useState<number>(() => {
    const report = computeCalorieReport(inputs);
    return report ? report.targetCalories : 1979;
  });
  const [targetLabel, setTargetLabel] = useState<string>(() => {
    const report = computeCalorieReport(inputs);
    return report ? report.activeGoalTier.title : 'Maintain';
  });

  // Persisted logged meals in local storage
  const [meals, setMeals] = useState<LoggedMeal[]>(() => {
    try {
      const saved = localStorage.getItem('freecalc_logged_meals');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [
      {
        id: 'init_1',
        name: 'Avocado Toast & Poached Egg (Scanner)',
        calories: 420,
        protein: 16,
        carbs: 38,
        fat: 23,
        time: '08:30 AM',
        source: 'scanner',
      },
    ];
  });

  // Persisted streak data
  const [streakData, setStreakData] = useState<StreakData>(() => loadStreakData());

  // Save streak data
  useEffect(() => {
    saveStreakData(streakData);
  }, [streakData]);

  // Persisted user profile
  const [profile, setProfile] = useState<UserProfile>(() => loadUserProfile());

  // Firebase Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Subscribe to Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      if (user) {
        // Auto sync user name and email to profile if not customized
        setProfile((prev) => ({
          ...prev,
          name: user.displayName || prev.name,
          email: user.email || prev.email,
          photoUrl: user.photoURL || prev.photoUrl,
        }));

        // Send welcome email if not previously sent
        if (user.email) {
          dispatchWelcomeEmail({
            toEmail: user.email,
            userName: user.displayName || user.email.split('@')[0],
          }).catch((err) => console.warn('Background welcome email check:', err));
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (user: FirebaseUser) => {
    setCurrentUser(user);
    const resolvedName = user.displayName || user.email?.split('@')[0] || 'Fitness Champion';
    setProfile((prev) => ({
      ...prev,
      name: resolvedName,
      email: user.email || prev.email,
      photoUrl: user.photoURL || prev.photoUrl,
    }));
    toastSuccess('Signed In Successfully!', `Welcome, ${resolvedName}!`);

    // Immediately dispatch welcome email from roshanlokhande43@gmail.com to user's registered email
    if (user.email) {
      dispatchWelcomeEmail({
        toEmail: user.email,
        userName: resolvedName,
        force: true,
      }).then((res) => {
        if (res.success) {
          toastSuccess(
            '✉️ Welcome to Health-Meta!',
            `Welcome message sent to ${user.email} from roshanlokhande43@gmail.com`
          );
        }
      }).catch((err) => {
        console.warn('Welcome email dispatch warning:', err);
      });
    }
  };

  const handleOpenAuthModal = () => {
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setCurrentUser(null);
      toastInfo('Signed Out', 'You have been successfully signed out.');
    } catch (error: any) {
      toastError('Sign Out Failed', error?.message || 'Could not sign out.');
    }
  };

  // Persisted notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() =>
    loadNotificationSettings()
  );

  // Persisted notification history logs
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() =>
    loadNotificationLogs()
  );

  // Save profile changes
  useEffect(() => {
    saveUserProfile(profile);
  }, [profile]);

  // Save notification settings changes
  useEffect(() => {
    saveNotificationSettings(notificationSettings);
  }, [notificationSettings]);

  // Save notification logs changes
  useEffect(() => {
    saveNotificationLogs(notificationLogs);
  }, [notificationLogs]);

  // Persisted logged exercises
  const [loggedExercises, setLoggedExercises] = useState<LoggedExercise[]>(() => {
    try {
      const saved = localStorage.getItem('healthmeta_logged_exercises');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return [];
  });

  const handleLogExercise = useCallback((exercise: LoggedExercise) => {
    setLoggedExercises((prev) => {
      const updated = [exercise, ...prev];
      try {
        localStorage.setItem('healthmeta_logged_exercises', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
    toastSuccess('Workout Logged! 🏃', `${exercise.name}: -${exercise.caloriesBurned} kcal burned!`);
  }, [toastSuccess]);

  // Handle incoming notification log addition
  const handleNewNotificationLog = useCallback((log: NotificationLog) => {
    setNotificationLogs((prev) => [log, ...prev]);
  }, []);

  // Handle in-app toast from notification scheduler
  const handleNotificationToast = useCallback(
    (title: string, message: string) => {
      toastInfo(title, message);
    },
    [toastInfo]
  );

  // Check if meals logged today
  const hasMealsLoggedToday = useMemo(() => {
    return meals.length > 0;
  }, [meals]);

  // Real-time time-to-time notification scheduler background engine
  useNotificationScheduler({
    profile,
    settings: notificationSettings,
    onNewNotificationLog: handleNewNotificationLog,
    onToast: handleNotificationToast,
    hasMealsLoggedToday,
  });

  // Handler to update profile and sync to calculator
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setInputs((prev) => syncProfileToCalculatorInputs(updatedProfile, prev));
    toastSuccess('Profile Updated', 'Biometrics & Meal Schedule saved and synced with calculator.');
  };

  // Handler to update notification settings
  const handleUpdateNotificationSettings = (updatedSettings: NotificationSettings) => {
    setNotificationSettings(updatedSettings);
  };

  // Handler to clear notification logs
  const handleClearNotificationLogs = () => {
    setNotificationLogs([]);
    toastInfo('Logs Cleared', 'Notification history has been cleared.');
  };

  // Save meals to local storage
  useEffect(() => {
    try {
      localStorage.setItem('freecalc_logged_meals', JSON.stringify(meals));
    } catch (e) {
      console.warn(e);
    }
  }, [meals]);

  // Sync inputs to browser URL query string
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryString = serializeInputsToQuery(inputs);
      const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [inputs]);

  const handleShareLink = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        setShareCopied(true);
        toastCopy('Shareable URL Copied!', 'Your customized calorie and macro plan link is ready to share.');
        setTimeout(() => setShareCopied(false), 2500);
      });
    }
  };

  const handleScrollToCalculator = () => {
    if (activePage !== 'calculator') {
      setActivePage('calculator');
    }
    setTimeout(() => {
      const element = document.getElementById('calculator');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleSetDailyTarget = (calories: number, label: string) => {
    setDailyTarget(calories);
    setTargetLabel(label);
    setActivePage('tracker');
    toastSuccess('Daily Target Updated', `Tracker goal set to ${calories} kcal (${label}).`);
  };

  const handleLogMeal = (mealData: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    category?: MealCategory;
    portionSize?: string;
  }) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMeal: LoggedMeal = {
      id: 'meal_' + Date.now(),
      name: mealData.name,
      calories: mealData.calories,
      protein: Math.round(mealData.protein),
      carbs: Math.round(mealData.carbs),
      fat: Math.round(mealData.fat),
      category: mealData.category || getAutoMealCategory(),
      portionSize: mealData.portionSize,
      time: timeStr,
      source: 'scanner',
    };
    setMeals((prev) => [newMeal, ...prev]);
    toastMeal(mealData.name, mealData.calories);

    // Update streak
    const { updatedData, streakIncreased } = recordMealLogToStreak(streakData, mealData.calories);
    setStreakData(updatedData);
    if (streakIncreased) {
      toastSuccess('Streak Active! 🔥', `${updatedData.currentStreak}-day logging streak recorded!`);
    }

    setActivePage('tracker');
  };

  const handleAddManualMeal = (mealData: Omit<LoggedMeal, 'id' | 'time' | 'source'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMeal: LoggedMeal = {
      id: 'meal_' + Date.now(),
      ...mealData,
      category: mealData.category || getAutoMealCategory(),
      time: timeStr,
      source: 'manual',
    };
    setMeals((prev) => [newMeal, ...prev]);
    toastMeal(mealData.name, mealData.calories);

    // Update streak
    const { updatedData, streakIncreased } = recordMealLogToStreak(streakData, mealData.calories);
    setStreakData(updatedData);
    if (streakIncreased) {
      toastSuccess('Streak Active! 🔥', `${updatedData.currentStreak}-day logging streak recorded!`);
    }
  };

  const handleRemoveMeal = (id: string) => {
    const mealToDelete = meals.find((m) => m.id === id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
    if (mealToDelete) {
      toastInfo('Item Removed', `"${mealToDelete.name}" removed from log.`);
    }
  };

  const handleClearAllMeals = () => {
    if (window.confirm('Clear all logged meals for today?')) {
      setMeals([]);
      toastInfo('Daily Log Reset', 'All meal entries for today have been cleared.');
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen transition-colors duration-300 flex flex-col font-sans selection:bg-blue-500/30 relative ${
        isDark
          ? 'bg-[#06080e] text-slate-100'
          : 'bg-white text-slate-900'
      }`}
    >
      {/* Continuous Ambient Animated Background */}
      <AnimatedBackground isDark={isDark} />

      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        theme={theme}
        setTheme={setTheme}
        onOpenCalculator={handleScrollToCalculator}
        onOpenStreak={() => {
          setActivePage('tracker');
          setTimeout(() => {
            const el = document.getElementById('streak-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }, 100);
        }}
        loggedMealsCount={meals.length}
        currentStreak={streakData.currentStreak}
        userAvatar={profile.avatar}
        userName={profile.name}
        userPhotoUrl={profile.photoUrl}
        notificationsEnabled={notificationSettings.enabled}
        currentUser={currentUser}
        onGoogleSignIn={handleOpenAuthModal}
        onSignOut={handleSignOut}
        isAuthLoading={isAuthLoading}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        {/* Page 1: Calculator (Hero + Live Two-Card Calculator Layout matching Screenshots 1, 2, 3) */}
        {activePage === 'calculator' && (
          <div className="space-y-12">
            {/* Hero Section matching Screenshot 1 & 3 */}
            <HeroSection
              theme={theme}
              onOpenCalculator={handleScrollToCalculator}
              onOpenMethodology={() => {
                setActivePage('methodology');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Side-by-Side Calculator Section matching Screenshot 2 */}
            <CalculatorSection
              inputs={inputs}
              setInputs={setInputs}
              result={results}
              onSetDailyTarget={handleSetDailyTarget}
              onScanFoodShortcut={() => {
                setActivePage('scanner');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenTracker={() => {
                setActivePage('tracker');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShareLink={handleShareLink}
              shareCopied={shareCopied}
              theme={theme}
            />
          </div>
        )}

        {/* Page 2: AI Food Scanner */}
        {activePage === 'scanner' && (
          <AIFoodScanner theme={theme} onLogMeal={handleLogMeal} />
        )}

        {/* Page: Real-Time Exercise Engine */}
        {activePage === 'exercise' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <RealtimeExerciseSuggester
              weightKg={Number(inputs.weightKg) || profile.weightKg || 70}
              goal={inputs.goal || profile.goal || 'lose'}
              totalCaloriesLoggedToday={meals.reduce((sum, m) => sum + m.calories, 0)}
              targetCalories={dailyTarget}
              mealsLogged={meals}
              theme={theme}
              onLogExercise={handleLogExercise}
              onGoToTracker={() => {
                setActivePage('tracker');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* Page 3: Daily Tracker */}
        {activePage === 'tracker' && (
          <DailyTracker
            theme={theme}
            targetCalories={dailyTarget}
            targetLabel={targetLabel}
            meals={meals}
            streakData={streakData}
            exercises={loggedExercises}
            onUpdateStreak={setStreakData}
            onAddManualMeal={handleAddManualMeal}
            onRemoveMeal={handleRemoveMeal}
            onClearAll={handleClearAllMeals}
            onSetCustomTarget={setDailyTarget}
            onOpenScanner={() => {
              setActivePage('scanner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoToExercise={() => {
              setActivePage('exercise');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Page 4: User Profile & Time-to-Time Mobile Alerts */}
        {activePage === 'profile' && (
          <UserProfilePage
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            notificationSettings={notificationSettings}
            onUpdateNotificationSettings={handleUpdateNotificationSettings}
            notificationLogs={notificationLogs}
            onClearNotificationLogs={handleClearNotificationLogs}
            theme={theme}
            meals={meals}
            targetCalories={dailyTarget}
            onLogExercise={handleLogExercise}
            currentUser={currentUser}
            onGoogleSignIn={handleOpenAuthModal}
            onSignOut={handleSignOut}
            isAuthLoading={isAuthLoading}
            onGoToCalculator={() => {
              setActivePage('calculator');
              handleScrollToCalculator();
            }}
            onGoToTracker={() => {
              setActivePage('tracker');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Page 4: Methodology */}
        {activePage === 'methodology' && (
          <MethodologyPage
            theme={theme}
            onGoToCalculator={() => {
              setActivePage('calculator');
              handleScrollToCalculator();
            }}
          />
        )}

        {/* Page 5: About */}
        {activePage === 'about' && (
          <AboutPage
            theme={theme}
            onGoToCalculator={() => {
              setActivePage('calculator');
              handleScrollToCalculator();
            }}
          />
        )}

        {/* Page 6: FAQ */}
        {activePage === 'faq' && <FAQPage theme={theme} />}

        {/* Page 7: Privacy & Terms */}
        {(activePage === 'privacy' || activePage === 'terms') && (
          <PrivacyTermsPage theme={theme} />
        )}

        {/* Page 8: Contact */}
        {activePage === 'contact' && (
          <ContactPage
            theme={theme}
            onGoToFAQ={() => {
              setActivePage('faq');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Footer (Structured Premium Fat Footer) */}
      <footer
        className={`relative z-10 border-t pt-16 pb-12 mt-20 transition-colors ${
          isDark
            ? 'bg-[#0a0a0a] border-white/[0.06] text-[#8892b0]'
            : 'bg-white border-slate-200 text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Main Footer Area: Multi-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
            {/* Column 1: Brand (Width ~35-40% on Desktop) */}
            <div className="md:col-span-6 lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-950 font-black shadow-md shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <span
                  className={`font-extrabold text-lg tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Health Meta
                </span>
              </div>
              <p
                className={`text-[13px] leading-relaxed max-w-sm ${
                  isDark ? 'text-[#8892b0]' : 'text-slate-500'
                }`}
              >
                Mifflin-St Jeor metabolic intelligence &amp;
                <br />
                real-time exercise engine
              </p>
            </div>

            {/* Column 2: PRODUCT */}
            <div className="md:col-span-3 lg:col-span-3 space-y-3.5">
              <h4
                className={`text-[11px] font-bold uppercase tracking-[1.5px] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                PRODUCT
              </h4>
              <ul className="flex flex-col space-y-2.5 text-[13px]">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('calculator');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center text-[#8892b0] hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer"
                  >
                    Calculator
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('scanner');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center text-[#8892b0] hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer"
                  >
                    AI Food Scanner
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('exercise');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-2 text-white hover:translate-x-1 transition-all duration-200 cursor-pointer group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[#10b981] group-hover:text-emerald-300 font-medium transition-colors">
                      Workouts
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('tracker');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center text-[#8892b0] hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer"
                  >
                    Daily Log
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('profile');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center text-[#8892b0] hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer"
                  >
                    Profile &amp; Alerts
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: COMPANY */}
            <div className="md:col-span-3 lg:col-span-4 space-y-3.5">
              <h4
                className={`text-[11px] font-bold uppercase tracking-[1.5px] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                COMPANY
              </h4>
              <ul className="flex flex-col space-y-2.5 text-[13px]">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('methodology');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center text-[#8892b0] hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer"
                  >
                    Methodology
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('about');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center text-[#8892b0] hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('faq');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center text-[#8892b0] hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('privacy');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center text-[#8892b0] hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer"
                  >
                    Privacy &amp; Terms
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('contact');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center text-[#8892b0] hover:text-white hover:translate-x-1 transition-all duration-200 cursor-pointer"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Sub-footer (Bottom Bar) */}
          <div
            className={`pt-8 border-t flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs ${
              isDark ? 'border-white/[0.05] text-[#8892b0]' : 'border-slate-100 text-slate-500'
            }`}
          >
            {/* Left side: Copyright & Creator Details */}
            <div className="space-y-1">
              <p className="font-medium text-white/90">
                © 2026 Free Calorie Calculator • Zero Tracking
              </p>
              <p className="text-[11px] text-[#8892b0]/80">
                Created by{' '}
                <strong className={isDark ? 'text-zinc-200' : 'text-slate-800'}>
                  Roshan Lokhande
                </strong>{' '}
                (Roll No: 266597, A3 | Dept. of IT, K.B.P. College Vashi)
              </p>
            </div>

            {/* Right side: Purpose statement */}
            <p className="text-left md:text-right text-[11px] text-[#8892b0]/70 max-w-xs md:max-w-none">
              For educational &amp; dietary planning purposes only.
            </p>
          </div>
        </div>
      </footer>

      {/* Authentication Modal (Google & Email/Password with error diagnostics) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
}
