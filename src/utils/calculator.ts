import {
  ActivityLevel,
  ActivityOption,
  CalculationResult,
  CalculatorInputs,
  Gender,
  GoalCalorieTier,
  MacroSplit,
} from '../types';

export const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    multiplier: 1.2,
    description: 'Little or no exercise, desk job',
    daysText: '0 days/wk',
  },
  {
    value: 'light',
    label: 'Lightly Active',
    multiplier: 1.375,
    description: 'Light exercise or sports 1-3 days a week',
    daysText: '1-3 days/wk',
  },
  {
    value: 'moderate',
    label: 'Moderately Active',
    multiplier: 1.55,
    description: 'Moderate exercise or sports 3-5 days a week',
    daysText: '3-5 days/wk',
  },
  {
    value: 'very',
    label: 'Very Active',
    multiplier: 1.725,
    description: 'Hard exercise or sports 6-7 days a week',
    daysText: '6-7 days/wk',
  },
  {
    value: 'extra',
    label: 'Extra Active',
    multiplier: 1.9,
    description: 'Very hard physical job or 2x daily training',
    daysText: 'Daily+',
  },
];

export function calculateMacros(calories: number, proteinPct = 30, carbsPct = 45, fatPct = 25): MacroSplit {
  const proteinKcal = Math.round((calories * proteinPct) / 100);
  const carbsKcal = Math.round((calories * carbsPct) / 100);
  const fatKcal = Math.round((calories * fatPct) / 100);

  const proteinG = Math.round(proteinKcal / 4);
  const carbsG = Math.round(carbsKcal / 4);
  const fatG = Math.round(fatKcal / 9);

  return {
    proteinG,
    proteinKcal,
    proteinPct,
    carbsG,
    carbsKcal,
    carbsPct,
    fatG,
    fatKcal,
    fatPct,
  };
}

function buildTier(
  id: string,
  title: string,
  paceType: 'mild' | 'standard' | 'aggressive' | 'maintain' | 'bulking',
  tdee: number,
  diff: number,
  paceDescription: string,
  weeklyFatChangeKg: number,
  proteinPct: number,
  carbsPct: number,
  fatPct: number
): GoalCalorieTier {
  const calories = Math.max(1000, Math.round(tdee + diff));
  const timeframeDescription =
    diff === 0
      ? 'Weight remains steady'
      : diff < 0
      ? `Lose approx ${Math.abs(weeklyFatChangeKg)} kg / week`
      : `Gain approx ${weeklyFatChangeKg} kg / week`;

  return {
    id,
    title,
    paceType,
    calories,
    diff,
    paceDescription,
    timeframeDescription,
    macros: calculateMacros(calories, proteinPct, carbsPct, fatPct),
    weeklyFatChangeKg,
  };
}

export function computeCalorieReport(inputs: CalculatorInputs): CalculationResult | null {
  const age = Number(inputs.age);
  const height = Number(inputs.heightCm);
  const weight = Number(inputs.weightKg);

  if (!age || !height || !weight || age <= 0 || height <= 0 || weight <= 0) {
    return null;
  }

  // BMR calculation
  let bmr: number;
  if (inputs.formula === 'harris') {
    if (inputs.gender === 'male') {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }
  } else {
    // Mifflin-St Jeor
    if (inputs.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }
  bmr = Math.round(bmr);

  const actOption = ACTIVITY_OPTIONS.find((a) => a.value === inputs.activityLevel) || ACTIVITY_OPTIONS[0];
  const tdee = Math.round(bmr * actOption.multiplier);

  // BMI
  const heightM = height / 100;
  const bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;
  let bmiCategory = 'Normal weight';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
  else if (bmi >= 30) bmiCategory = 'Obese';

  const idealWeightRange = {
    min: Math.round(18.5 * heightM * heightM * 10) / 10,
    max: Math.round(24.9 * heightM * heightM * 10) / 10,
  };

  const waterIntakeLiters = Math.round(((weight * 35) / 1000) * 10) / 10;
  const waterIntakeOz = Math.round(waterIntakeLiters * 33.814);

  // Goal Tiers
  const weightLossTiers: GoalCalorieTier[] = [
    buildTier('mild_loss', 'Mild Weight Loss', 'mild', tdee, -250, '0.25 kg / week (-250 kcal/day)', -0.25, 30, 45, 25),
    buildTier('standard_loss', 'Weight Loss', 'standard', tdee, -500, '0.5 kg / week (-500 kcal/day)', -0.5, 35, 40, 25),
    buildTier('extreme_loss', 'Extreme Weight Loss', 'aggressive', tdee, -1000, '1 kg / week (-1000 kcal/day)', -1.0, 40, 35, 25),
  ];

  const maintenanceTier: GoalCalorieTier = buildTier(
    'maintain',
    'Maintain Weight',
    'maintain',
    tdee,
    0,
    'Steady state (0 kcal diff)',
    0,
    25,
    50,
    25
  );

  const weightGainTiers: GoalCalorieTier[] = [
    buildTier('mild_gain', 'Mild Weight Gain', 'mild', tdee, 250, '0.25 kg / week (+250 kcal/day)', 0.25, 25, 50, 25),
    buildTier('standard_gain', 'Weight Gain', 'standard', tdee, 500, '0.5 kg / week (+500 kcal/day)', 0.5, 25, 55, 20),
    buildTier('fast_gain', 'Fast Weight Gain', 'bulking', tdee, 1000, '1 kg / week (+1000 kcal/day)', 1.0, 25, 55, 20),
  ];

  const allTiers = [...weightLossTiers, maintenanceTier, ...weightGainTiers];

  let activeGoalTier = maintenanceTier;
  if (inputs.goal === 'lose') {
    activeGoalTier = weightLossTiers[1]; // standard weight loss
  } else if (inputs.goal === 'gain') {
    activeGoalTier = weightGainTiers[1]; // standard weight gain
  }

  let timelineWeeks: number | undefined;
  if (inputs.targetWeightKg && Number(inputs.targetWeightKg) > 0) {
    const targetW = Number(inputs.targetWeightKg);
    const diffKg = Math.abs(weight - targetW);
    const weeklyRate = Math.abs(activeGoalTier.weeklyFatChangeKg) || 0.5;
    timelineWeeks = Math.max(1, Math.round(diffKg / weeklyRate));
  }

  return {
    bmr,
    tdee,
    targetCalories: activeGoalTier.calories,
    activeGoalTier,
    bmi,
    bmiCategory,
    idealWeightRange,
    waterIntakeLiters,
    waterIntakeOz,
    formulaUsed: inputs.formula === 'harris' ? 'Harris-Benedict' : 'Mifflin-St Jeor',
    weightLossTiers,
    weightGainTiers,
    maintenanceTier,
    allTiers,
    timelineWeeks,
  };
}

export function parseInputsFromQuery(search: string): Partial<CalculatorInputs> {
  const params = new URLSearchParams(search);
  const result: Partial<CalculatorInputs> = {};

  if (params.has('age')) result.age = Number(params.get('age')) || '';
  if (params.has('gender')) result.gender = params.get('gender') as Gender;
  if (params.has('heightCm')) result.heightCm = Number(params.get('heightCm')) || '';
  if (params.has('weightKg')) result.weightKg = Number(params.get('weightKg')) || '';
  if (params.has('activityLevel')) result.activityLevel = params.get('activityLevel') as ActivityLevel;
  if (params.has('goal')) result.goal = params.get('goal') as any;
  if (params.has('targetWeightKg')) result.targetWeightKg = Number(params.get('targetWeightKg')) || '';
  if (params.has('formula')) result.formula = params.get('formula') as any;

  return result;
}

export function serializeInputsToQuery(inputs: CalculatorInputs): string {
  const params = new URLSearchParams();
  if (inputs.age) params.set('age', String(inputs.age));
  if (inputs.gender) params.set('gender', inputs.gender);
  if (inputs.heightCm) params.set('heightCm', String(inputs.heightCm));
  if (inputs.weightKg) params.set('weightKg', String(inputs.weightKg));
  if (inputs.activityLevel) params.set('activityLevel', inputs.activityLevel);
  if (inputs.goal) params.set('goal', inputs.goal);
  if (inputs.targetWeightKg) params.set('targetWeightKg', String(inputs.targetWeightKg));
  if (inputs.formula) params.set('formula', inputs.formula);
  return params.toString();
}
