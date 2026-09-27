import React, { useState } from 'react';
import { ActivityLevel, CalculatorInputs, Gender, PrimaryGoal } from '../types';
import { ACTIVITY_OPTIONS } from '../utils/calculator';
import {
  Calculator,
  RotateCcw,
  User,
  Activity,
  Ruler,
  Weight,
  Target,
  Info,
  TrendingDown,
  Scale,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface CalorieFormProps {
  inputs: CalculatorInputs;
  setInputs: React.Dispatch<React.SetStateAction<CalculatorInputs>>;
  onReset: () => void;
}

export const CalorieForm: React.FC<CalorieFormProps> = ({
  inputs,
  setInputs,
  onReset,
}) => {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [heightFeet, setHeightFeet] = useState<number | ''>(5);
  const [heightInches, setHeightInches] = useState<number | ''>(10);
  const [weightLbs, setWeightLbs] = useState<number | ''>(163);

  // Sync unit conversions
  const handleUnitToggle = (unit: 'metric' | 'imperial') => {
    if (unit === unitSystem) return;
    setUnitSystem(unit);

    if (unit === 'imperial') {
      // Metric to Imperial
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
      // Imperial to Metric
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

  const loadPreset = (type: 'male_std' | 'female_std' | 'athlete') => {
    if (type === 'male_std') {
      setInputs({
        age: 30,
        gender: 'male',
        heightCm: 175,
        weightKg: 74,
        activityLevel: 'moderate',
        goal: 'lose',
        targetWeightKg: 68,
        formula: 'mifflin',
      });
      setHeightFeet(5);
      setHeightInches(9);
      setWeightLbs(163);
    } else if (type === 'female_std') {
      setInputs({
        age: 27,
        gender: 'female',
        heightCm: 165,
        weightKg: 62,
        activityLevel: 'light',
        goal: 'lose',
        targetWeightKg: 57,
        formula: 'mifflin',
      });
      setHeightFeet(5);
      setHeightInches(5);
      setWeightLbs(136);
    } else {
      setInputs({
        age: 24,
        gender: 'male',
        heightCm: 182,
        weightKg: 82,
        activityLevel: 'very',
        goal: 'gain',
        targetWeightKg: 86,
        formula: 'mifflin',
      });
      setHeightFeet(6);
      setHeightInches(0);
      setWeightLbs(181);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
      {/* Header & Units Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
              <Calculator className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Calorie & Metabolic Input Form
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Calculates live as you type using the clinical Mifflin-St Jeor equation.
          </p>
        </div>

        {/* Unit Toggle & Reset */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              id="btn-unit-metric"
              type="button"
              onClick={() => handleUnitToggle('metric')}
              className={`px-3 py-1.5 rounded-xl transition ${
                unitSystem === 'metric' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Metric (cm / kg)
            </button>
            <button
              id="btn-unit-imperial"
              type="button"
              onClick={() => handleUnitToggle('imperial')}
              className={`px-3 py-1.5 rounded-xl transition ${
                unitSystem === 'imperial' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Imperial (ft / lb)
            </button>
          </div>

          <button
            type="button"
            onClick={onReset}
            title="Reset to default inputs"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto pb-1">
        <span className="font-bold text-slate-700 whitespace-nowrap">Presets:</span>
        <button
          type="button"
          onClick={() => loadPreset('male_std')}
          className="px-3 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition border border-slate-200 whitespace-nowrap font-medium cursor-pointer"
        >
          30y Male (74kg, Lose)
        </button>
        <button
          type="button"
          onClick={() => loadPreset('female_std')}
          className="px-3 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition border border-slate-200 whitespace-nowrap font-medium cursor-pointer"
        >
          27y Female (62kg, Lose)
        </button>
        <button
          type="button"
          onClick={() => loadPreset('athlete')}
          className="px-3 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 transition border border-slate-200 whitespace-nowrap font-medium cursor-pointer"
        >
          24y Athlete (82kg, Bulking)
        </button>
      </div>

      <div className="space-y-6 pt-2">
        {/* 1. Biological Sex (Male / Female) */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
            1. Biological Sex <span className="text-emerald-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              id="sex-male-btn"
              onClick={() => setInputs((prev) => ({ ...prev, gender: 'male' }))}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition text-left flex items-center justify-between cursor-pointer ${
                inputs.gender === 'male'
                  ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                    inputs.gender === 'male' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ♂
                </div>
                <div>
                  <span className="block text-sm sm:text-base font-bold">Male</span>
                  <span className="text-[11px] text-slate-500 block font-normal">+5 Mifflin adjustment</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              id="sex-female-btn"
              onClick={() => setInputs((prev) => ({ ...prev, gender: 'female' }))}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition text-left flex items-center justify-between cursor-pointer ${
                inputs.gender === 'female'
                  ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                    inputs.gender === 'female' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ♀
                </div>
                <div>
                  <span className="block text-sm sm:text-base font-bold">Female</span>
                  <span className="text-[11px] text-slate-500 block font-normal">-161 Mifflin adjustment</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Age, Height, Weight Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Age */}
          <div>
            <label htmlFor="input-age" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              2. Age (Years) <span className="text-emerald-600">*</span>
            </label>
            <div className="relative">
              <input
                id="input-age"
                type="number"
                min="12"
                max="110"
                placeholder="e.g. 30"
                value={inputs.age}
                onChange={(e) =>
                  setInputs((prev) => ({
                    ...prev,
                    age: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)),
                  }))
                }
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-base"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                yrs
              </span>
            </div>
          </div>

          {/* Height */}
          <div>
            <label htmlFor="input-height" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              3. Height <span className="text-emerald-600">*</span>
            </label>
            {unitSystem === 'metric' ? (
              <div className="relative">
                <input
                  id="input-height"
                  type="number"
                  min="60"
                  max="260"
                  placeholder="e.g. 175"
                  value={inputs.heightCm}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      heightCm: e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)),
                    }))
                  }
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-base"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  cm
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    id="input-height-feet"
                    type="number"
                    min="3"
                    max="8"
                    placeholder="Ft"
                    value={heightFeet}
                    onChange={(e) =>
                      handleImperialHeightChange(
                        e.target.value === '' ? '' : parseInt(e.target.value, 10),
                        heightInches
                      )
                    }
                    className="w-full pl-3 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ft
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="input-height-inches"
                    type="number"
                    min="0"
                    max="11"
                    placeholder="In"
                    value={heightInches}
                    onChange={(e) =>
                      handleImperialHeightChange(
                        heightFeet,
                        e.target.value === '' ? '' : parseInt(e.target.value, 10)
                      )
                    }
                    className="w-full pl-3 pr-8 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    in
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Current Weight */}
          <div>
            <label htmlFor="input-weight" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
              4. Current Weight <span className="text-emerald-600">*</span>
            </label>
            {unitSystem === 'metric' ? (
              <div className="relative">
                <input
                  id="input-weight"
                  type="number"
                  min="25"
                  max="350"
                  step="0.1"
                  placeholder="e.g. 74"
                  value={inputs.weightKg}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      weightKg: e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)),
                    }))
                  }
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-base"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  kg
                </span>
              </div>
            ) : (
              <div className="relative">
                <input
                  id="input-weight-lbs"
                  type="number"
                  min="55"
                  max="700"
                  step="0.1"
                  placeholder="e.g. 163"
                  value={weightLbs}
                  onChange={(e) =>
                    handleImperialWeightChange(
                      e.target.value === '' ? '' : parseFloat(e.target.value)
                    )
                  }
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition text-base"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  lb
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 5. Activity Level Dropdown */}
        <div>
          <label htmlFor="select-activity-level" className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
            5. Daily Physical Activity Level <span className="text-emerald-600">*</span>
          </label>
          <div className="relative">
            <select
              id="select-activity-level"
              value={inputs.activityLevel}
              onChange={(e) =>
                setInputs((prev) => ({ ...prev, activityLevel: e.target.value as ActivityLevel }))
              }
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition appearance-none cursor-pointer text-sm sm:text-base"
            >
              {ACTIVITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.description} ({opt.daysText}, ×{opt.multiplier})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* 6. Goal Selection (Lose Weight, Maintain, Gain Weight) */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
            6. Primary Weight Goal <span className="text-emerald-600">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              id="goal-lose-btn"
              onClick={() => setInputs((prev) => ({ ...prev, goal: 'lose' }))}
              className={`p-3.5 rounded-2xl border-2 transition text-left flex items-center gap-3 cursor-pointer ${
                inputs.goal === 'lose'
                  ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  inputs.goal === 'lose' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-bold">Lose Weight</span>
                <span className="text-[11px] text-slate-500 block font-normal">-500 kcal deficit</span>
              </div>
            </button>

            <button
              type="button"
              id="goal-maintain-btn"
              onClick={() => setInputs((prev) => ({ ...prev, goal: 'maintain' }))}
              className={`p-3.5 rounded-2xl border-2 transition text-left flex items-center gap-3 cursor-pointer ${
                inputs.goal === 'maintain'
                  ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  inputs.goal === 'maintain' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-bold">Maintain Weight</span>
                <span className="text-[11px] text-slate-500 block font-normal">TDEE balance</span>
              </div>
            </button>

            <button
              type="button"
              id="goal-gain-btn"
              onClick={() => setInputs((prev) => ({ ...prev, goal: 'gain' }))}
              className={`p-3.5 rounded-2xl border-2 transition text-left flex items-center gap-3 cursor-pointer ${
                inputs.goal === 'gain'
                  ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  inputs.goal === 'gain' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-bold">Gain Muscle</span>
                <span className="text-[11px] text-slate-500 block font-normal">+250-500 kcal surplus</span>
              </div>
            </button>
          </div>
        </div>

        {/* Optional Target Weight for Timeline Forecast */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-600" />
            <span>Optional Target Goal Weight (for timeline projector):</span>
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="30"
              max="300"
              step="0.5"
              placeholder={unitSystem === 'metric' ? 'e.g. 68 kg' : 'e.g. 150 lb'}
              value={
                unitSystem === 'metric'
                  ? inputs.targetWeightKg || ''
                  : inputs.targetWeightKg
                  ? Math.round(Number(inputs.targetWeightKg) * 2.20462)
                  : ''
              }
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setInputs((p) => ({ ...p, targetWeightKg: '' }));
                } else {
                  const num = parseFloat(val);
                  const kg = unitSystem === 'metric' ? num : Math.round(num / 2.20462);
                  setInputs((p) => ({ ...p, targetWeightKg: kg }));
                }
              }}
              className="w-32 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white"
            />
            <span className="text-slate-400 font-bold">{unitSystem === 'metric' ? 'kg' : 'lb'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
