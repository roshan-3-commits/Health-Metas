import { ExerciseRecommendation, PrimaryGoal, ActivityLevel, LoggedMeal } from '../types';

interface RealtimeContext {
  weightKg: number;
  goal: PrimaryGoal;
  activityLevel?: ActivityLevel;
  totalCaloriesLoggedToday: number;
  targetCalories: number;
  mealsLogged: LoggedMeal[];
  currentTime?: Date;
}

export function calculateCaloriesBurned(met: number, weightKg: number, durationMinutes: number): number {
  const safeWeight = weightKg > 30 ? weightKg : 70;
  const hours = durationMinutes / 60;
  return Math.round(met * safeWeight * hours);
}

export function getRealtimeExerciseSuggestions(ctx: RealtimeContext): {
  recommendations: ExerciseRecommendation[];
  contextSummary: {
    status: 'surplus' | 'deficit' | 'balanced' | 'morning_start';
    calorieDiff: number;
    headline: string;
    subheadline: string;
    timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
    suggestedFocus: string;
  };
} {
  const {
    weightKg = 70,
    goal = 'lose',
    totalCaloriesLoggedToday = 0,
    targetCalories = 2000,
    mealsLogged = [],
    currentTime = new Date(),
  } = ctx;

  const currentHour = currentTime.getHours();
  let timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night' = 'Morning';
  if (currentHour >= 5 && currentHour < 12) timeOfDay = 'Morning';
  else if (currentHour >= 12 && currentHour < 17) timeOfDay = 'Afternoon';
  else if (currentHour >= 17 && currentHour < 22) timeOfDay = 'Evening';
  else timeOfDay = 'Night';

  const calorieDiff = totalCaloriesLoggedToday - targetCalories;
  const isSurplus = calorieDiff > 100;
  const isDeficit = calorieDiff < -200;
  const isBalanced = !isSurplus && !isDeficit;
  const hasMeals = mealsLogged.length > 0;

  let status: 'surplus' | 'deficit' | 'balanced' | 'morning_start' = 'morning_start';
  let headline = '';
  let subheadline = '';
  let suggestedFocus = '';

  if (!hasMeals && timeOfDay === 'Morning') {
    status = 'morning_start';
    headline = 'Fresh Morning Routine';
    subheadline = 'Start your morning with a light walk or quick stretch to feel energetic and kickstart your day.';
    suggestedFocus = 'Light Cardio & Stretch';
  } else if (isSurplus) {
    status = 'surplus';
    headline = `Calorie Burn Window (+${Math.abs(calorieDiff)} kcal)`;
    subheadline = `You had a good meal! A brisk 20-30 min walk or quick workout will help burn ~${Math.abs(calorieDiff)} kcal and aid digestion.`;
    suggestedFocus = 'Brisk Walk or Fun Cardio';
  } else if (isDeficit) {
    status = 'deficit';
    headline = `Great Job Today (${Math.abs(calorieDiff)} kcal remaining)`;
    subheadline = goal === 'gain' 
      ? `You have calories left for muscle growth. Try a simple strength or bodyweight workout.`
      : `You are in a healthy calorie range. A simple walk or light workout will keep you fit and active.`;
    suggestedFocus = goal === 'gain' ? 'Strength & Tone' : 'Easy Cardio & Steps';
  } else {
    status = 'balanced';
    headline = 'Perfect Calorie Balance';
    subheadline = 'Your calories are well balanced today. Keep moving with a fun and easy routine.';
    suggestedFocus = 'Active & Healthy Habits';
  }

  // Raw base exercise templates with standardized MET values
  const baseExercises = [
    {
      id: 'brisk-walk',
      name: 'Brisk Walk',
      category: 'walking' as const,
      categoryLabel: 'Walking',
      met: 3.8,
      durationMinutes: 30,
      intensity: 'Low' as const,
      equipment: 'Walking Shoes',
      muscleFocus: ['Legs', 'Heart', 'Digestion'],
      timingBest: 'Anytime' as const,
      difficulty: 'Beginner' as const,
      reason: 'Easy and relaxing. Great after meals to aid digestion, improve mood, and burn calories without getting tired.',
      instructions: [
        'Walk at a comfortable, steady pace (faster than a stroll).',
        'Keep your head up, back straight, and swing your arms naturally.',
        'Drink a glass of water before starting and enjoy your favorite music or podcast.',
      ],
    },
    {
      id: 'quick-home-workout',
      name: '15-Min Quick Home Workout',
      category: 'home_burner' as const,
      categoryLabel: 'Home Workout',
      met: 7.0,
      durationMinutes: 15,
      intensity: 'Moderate' as const,
      equipment: 'No Equipment Needed',
      muscleFocus: ['Full Body', 'Legs', 'Core'],
      timingBest: 'Morning' as const,
      difficulty: 'Beginner' as const,
      reason: 'Quick 15-minute routine you can do right in your living room. Burns calories fast with zero equipment.',
      instructions: [
        'Round 1: 30 seconds Jumping Jacks + 30 seconds rest',
        'Round 2: 30 seconds Bodyweight Squats + 30 seconds rest',
        'Round 3: 30 seconds High Knees or Marching in place',
        'Round 4: 30 seconds Incline or Knee Push-Ups',
        'Repeat 2 or 3 times at your own pace!',
      ],
    },
    {
      id: 'light-jogging',
      name: 'Light Jogging / Running',
      category: 'cardio' as const,
      categoryLabel: 'Cardio',
      met: 8.0,
      durationMinutes: 25,
      intensity: 'Moderate' as const,
      equipment: 'Running Shoes',
      muscleFocus: ['Heart', 'Legs', 'Stamina'],
      timingBest: 'Morning' as const,
      difficulty: 'Intermediate' as const,
      reason: 'Super effective for burning fat, improving stamina, and clearing your mind.',
      instructions: [
        'Warm up with 3 minutes of brisk walking.',
        'Jog at a gentle, steady pace where you could still hold a short conversation.',
        'Cooldown with 2 minutes of relaxed walking and calf stretches.',
      ],
    },
    {
      id: 'cycling-ride',
      name: 'Cycling (Outdoor or Gym)',
      category: 'cardio' as const,
      categoryLabel: 'Cardio',
      met: 6.8,
      durationMinutes: 30,
      intensity: 'Moderate' as const,
      equipment: 'Bicycle or Exercise Bike',
      muscleFocus: ['Thighs', 'Calves', 'Cardio'],
      timingBest: 'Afternoon' as const,
      difficulty: 'Beginner' as const,
      reason: 'Gentle on your knees and joints while burning steady calories and toning your legs.',
      instructions: [
        'Adjust the seat height so your knees have a slight bend at the bottom of each pedal stroke.',
        'Pedal at a smooth, steady cadence of 60-80 RPM.',
        'Keep shoulders relaxed and breathe steadily.',
      ],
    },
    {
      id: 'strength-bodyweight',
      name: 'Simple Strength & Toning',
      category: 'strength' as const,
      categoryLabel: 'Strength',
      met: 5.5,
      durationMinutes: 25,
      intensity: 'Moderate' as const,
      equipment: 'Dumbbells or Bodyweight',
      muscleFocus: ['Chest', 'Arms', 'Legs', 'Abs'],
      timingBest: 'Evening' as const,
      difficulty: 'Beginner' as const,
      reason: 'Builds lean muscle, tones your body, and increases your daily metabolic calorie burn.',
      instructions: [
        'Exercise 1: 12 Bodyweight Squats (or holding light weights)',
        'Exercise 2: 10 Push-ups (on knees or against a wall if needed)',
        'Exercise 3: 12 Dumbbell or Water-bottle Rows',
        'Exercise 4: 20-30 second Plank hold',
        'Rest 60 seconds between sets; complete 3 rounds.',
      ],
    },
    {
      id: 'stretching-yoga',
      name: 'Stretching & Gentle Yoga',
      category: 'mobility' as const,
      categoryLabel: 'Relax & Stretch',
      met: 2.8,
      durationMinutes: 20,
      intensity: 'Low' as const,
      equipment: 'Yoga Mat or Carpet',
      muscleFocus: ['Back', 'Hips', 'Shoulders', 'Neck'],
      timingBest: 'Evening' as const,
      difficulty: 'Beginner' as const,
      reason: 'Relieves back and neck stiffness, lowers stress, and helps you get deep, refreshing sleep.',
      instructions: [
        'Cat-Cow Stretch: 5 slow deep breaths curving and flattening your spine.',
        'Child’s Pose: Relax on your knees with arms outstretched for 1-2 minutes.',
        'Seated Twist: Gently turn your torso to stretch your lower back.',
        'Deep breathing: Inhale for 4 seconds, exhale slowly for 4 seconds.',
      ],
    },
    {
      id: 'jump-rope-fun',
      name: 'Jump Rope / Skipping',
      category: 'cardio' as const,
      categoryLabel: 'Cardio',
      met: 10.0,
      durationMinutes: 15,
      intensity: 'High' as const,
      equipment: 'Jump Rope',
      muscleFocus: ['Calves', 'Cardio', 'Agility'],
      timingBest: 'Morning' as const,
      difficulty: 'Intermediate' as const,
      reason: 'Burns maximum calories in minimal time! Just 15 minutes equals 30 minutes of jogging.',
      instructions: [
        'Start with 30-second jumping intervals followed by 30 seconds of rest.',
        'Stay on the balls of your feet with knees softly bent.',
        'Aim for 5 to 10 rounds at your own rhythm.',
      ],
    },
    {
      id: 'core-abs',
      name: 'Abs & Core Toning',
      category: 'home_burner' as const,
      categoryLabel: 'Core',
      met: 4.5,
      durationMinutes: 15,
      intensity: 'Low' as const,
      equipment: 'Mat or Towel',
      muscleFocus: ['Abs', 'Lower Back', 'Waist'],
      timingBest: 'Anytime' as const,
      difficulty: 'Beginner' as const,
      reason: 'Strengthens your core and improves posture while trimming the waistline.',
      instructions: [
        '30-second standard Plank',
        '15 Crunches or Sit-ups',
        '20 Bicycle Crunches (slow and controlled)',
        'Take a 30-second break, then repeat 2 times.',
      ],
    },
  ];

  // Map each exercise to include real-time dynamic burned calorie calculation
  const recommendations: ExerciseRecommendation[] = baseExercises.map((ex) => {
    const estimatedBurnKcal = calculateCaloriesBurned(ex.met, weightKg, ex.durationMinutes);
    return {
      ...ex,
      estimatedBurnKcal,
    };
  });

  // Sort recommendations intelligently based on real-time status & user's goal
  recommendations.sort((a, b) => {
    // If in calorie surplus, prioritize highest calorie burner
    if (isSurplus) {
      return b.estimatedBurnKcal - a.estimatedBurnKcal;
    }
    // If muscle gain, prioritize strength
    if (goal === 'gain') {
      if (a.category === 'strength' && b.category !== 'strength') return -1;
      if (b.category === 'strength' && a.category !== 'strength') return 1;
    }
    // If night time, prioritize mobility & recovery
    if (timeOfDay === 'Night') {
      if (a.category === 'mobility' && b.category !== 'mobility') return -1;
      if (b.category === 'mobility' && a.category !== 'mobility') return 1;
    }
    return b.estimatedBurnKcal - a.estimatedBurnKcal;
  });

  return {
    recommendations,
    contextSummary: {
      status,
      calorieDiff,
      headline,
      subheadline,
      timeOfDay,
      suggestedFocus,
    },
  };
}
