export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';

export type PrimaryGoal = 'lose' | 'maintain' | 'gain';

export type WeightLossPace = 'mild' | 'standard' | 'aggressive';

export type NavPage = 'calculator' | 'scanner' | 'exercise' | 'tracker' | 'profile' | 'methodology' | 'about' | 'faq' | 'privacy' | 'terms' | 'contact';

export type ThemeMode = 'dark' | 'light';

export interface ActivityOption {
  value: ActivityLevel;
  label: string;
  multiplier: number;
  description: string;
  daysText: string;
}

export interface CalculatorInputs {
  age: number | '';
  gender: Gender;
  heightCm: number | '';
  weightKg: number | '';
  activityLevel: ActivityLevel;
  goal: PrimaryGoal;
  targetWeightKg?: number | '';
  formula: 'mifflin' | 'harris';
}

export interface MacroSplit {
  proteinG: number;
  proteinKcal: number;
  proteinPct: number;
  carbsG: number;
  carbsKcal: number;
  carbsPct: number;
  fatG: number;
  fatKcal: number;
  fatPct: number;
}

export interface GoalCalorieTier {
  id: string;
  title: string;
  paceType: 'mild' | 'standard' | 'aggressive' | 'maintain' | 'bulking';
  calories: number;
  diff: number;
  paceDescription: string;
  timeframeDescription: string;
  macros: MacroSplit;
  weeklyFatChangeKg: number;
}

export interface CalculationResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  activeGoalTier: GoalCalorieTier;
  bmi: number;
  bmiCategory: string;
  idealWeightRange: { min: number; max: number };
  waterIntakeLiters: number;
  waterIntakeOz: number;
  formulaUsed: string;
  weightLossTiers: GoalCalorieTier[];
  weightGainTiers: GoalCalorieTier[];
  maintenanceTier: GoalCalorieTier;
  allTiers: GoalCalorieTier[];
  timelineWeeks?: number;
}

export interface FoodScanIngredient {
  name: string;
  portion: string;
  calories: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
}

export interface FoodScanResult {
  id: string;
  foodName: string;
  portionSize: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  confidence: 'High' | 'Medium' | 'Estimated';
  confidencePercentage?: number; // e.g. 99.2%
  healthScore: number; // 0 - 100
  dietaryTags?: string[];
  breakdown: FoodScanIngredient[];
  cookingMethod?: string;
  glycemicIndex?: 'Low' | 'Medium' | 'High';
  micronutrients?: { name: string; amount: string }[];
  summary: string;
  imageUrl?: string;
  createdAt: number;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealSlotRecommendation {
  category: MealCategory;
  title: string;
  suggestedTime: string; // e.g. "08:00 AM - 09:30 AM"
  calorieTargetPct: number; // e.g. 25%
  recommendedCalories: number;
  description: string;
  foodSuggestions: string[];
}

export interface LoggedMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  category?: MealCategory;
  portionSize?: string;
  source: 'calculator' | 'scanner' | 'manual';
}

export interface StreakDayInfo {
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue, etc.
  dayNumber: number; // 1-31
  isToday: boolean;
  isLogged: boolean;
  calories?: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate: string | null; // YYYY-MM-DD
  loggedDates: string[]; // List of unique YYYY-MM-DD
  freezeTokens: number;
  totalDaysLogged: number;
  history: {
    date: string;
    calories: number;
    mealsCount: number;
  }[];
}

export type DietaryPreference = 'all' | 'vegetarian' | 'vegan' | 'eggetarian' | 'non-veg' | 'keto' | 'low-carb' | 'high-protein' | 'gluten-free';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  goal: PrimaryGoal;
  dietaryPreference: DietaryPreference;
  dailyWaterTargetLiters: number;
  dailyStepGoal: number;
  avatar: string;
  photoUrl?: string;
  breakfastTime: string; // HH:MM (24h)
  lunchTime: string; // HH:MM (24h)
  snackTime: string; // HH:MM (24h)
  dinnerTime: string; // HH:MM (24h)
  wakeTime: string; // HH:MM (24h)
  sleepTime: string; // HH:MM (24h)
  waterReminderIntervalHours: number;
  createdAt: number;
  updatedAt: number;
}

export interface CustomReminder {
  id: string;
  title: string;
  message: string;
  time: string; // HH:MM
  enabled: boolean;
  type: 'meal' | 'water' | 'workout' | 'streak' | 'custom';
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from?: string;
  isCustomConfigured?: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  emailAlertsEnabled: boolean;
  smsAlertsEnabled: boolean;
  whatsappAlertsEnabled: boolean;
  devicePushEnabled: boolean;
  breakfastReminder: boolean;
  lunchReminder: boolean;
  snackReminder: boolean;
  dinnerReminder: boolean;
  waterReminder: boolean;
  streakAlertReminder: boolean;
  nightReviewReminder: boolean;
  dailyEmailSummary: boolean;
  customReminders: CustomReminder[];
  permissionGranted: boolean;
  lastTestedAt?: number;
  smtpConfig?: SmtpConfig;
}

export interface NotificationLog {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'meal' | 'water' | 'streak' | 'custom' | 'system' | 'email' | 'sms';
  channel: 'push' | 'email' | 'sms' | 'whatsapp' | 'multichannel';
  recipient?: string;
  status: 'delivered' | 'sent' | 'pending' | 'failed';
  read: boolean;
  timestamp: number;
}

export interface ExerciseRecommendation {
  id: string;
  name: string;
  category: 'cardio' | 'hiit' | 'strength' | 'home_burner' | 'mobility' | 'walking';
  categoryLabel: string;
  met: number;
  durationMinutes: number;
  intensity: 'Low' | 'Moderate' | 'High' | 'Very High';
  estimatedBurnKcal: number;
  equipment: string;
  muscleFocus: string[];
  reason: string;
  instructions: string[];
  timingBest: 'Morning' | 'Afternoon' | 'Post-Meal' | 'Evening' | 'Anytime';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface LoggedExercise {
  id: string;
  name: string;
  durationMinutes: number;
  caloriesBurned: number;
  time: string;
  category: string;
  timestamp: number;
}


