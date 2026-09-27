import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { GoalCalorieTier, ThemeMode } from '../types';
import { TrendingDown, TrendingUp, Calendar, Target } from 'lucide-react';

interface WeightProjectionChartProps {
  startingWeightKg: number;
  activeTier: GoalCalorieTier;
  allTiers?: GoalCalorieTier[];
  theme?: ThemeMode;
  unitSystem?: 'metric' | 'imperial';
  targetWeightKg?: number | '';
}

export const WeightProjectionChart: React.FC<WeightProjectionChartProps> = ({
  startingWeightKg,
  activeTier,
  theme = 'dark',
  unitSystem = 'metric',
  targetWeightKg,
}) => {
  const isDark = theme === 'dark';
  const isImperial = unitSystem === 'imperial';
  const unitLabel = isImperial ? 'lbs' : 'kg';
  const toDisplayUnit = (kg: number) => (isImperial ? Math.round(kg * 2.20462 * 10) / 10 : Math.round(kg * 10) / 10);

  const weeklyRateKg = activeTier.weeklyFatChangeKg || 0;
  const isLosing = weeklyRateKg < 0;
  const isGaining = weeklyRateKg > 0;

  const targetDisplay = targetWeightKg && Number(targetWeightKg) > 0 ? toDisplayUnit(Number(targetWeightKg)) : null;

  const data = useMemo(() => {
    const points = [];
    const totalWeeks = 12;

    for (let w = 0; w <= totalWeeks; w++) {
      const projKg = Math.max(30, startingWeightKg + w * weeklyRateKg);
      points.push({
        week: w === 0 ? 'Start' : `Wk ${w}`,
        weekNum: w,
        weight: toDisplayUnit(projKg),
        target: targetDisplay,
      });
    }
    return points;
  }, [startingWeightKg, weeklyRateKg, isImperial, targetDisplay]);

  const endWeight = data[data.length - 1]?.weight || toDisplayUnit(startingWeightKg);
  const startWeight = data[0]?.weight || toDisplayUnit(startingWeightKg);
  const netDiff = Math.round((endWeight - startWeight) * 10) / 10;

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
        isDark ? 'bg-[#12151c] border-[#222733] text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isLosing
                ? 'bg-emerald-500/20 text-emerald-400'
                : isGaining
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {isLosing ? (
              <TrendingDown className="w-4 h-4" />
            ) : isGaining ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <Calendar className="w-4 h-4" />
            )}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold">12-Week Projected Trajectory</h4>
            <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Based on {activeTier.title} ({activeTier.calories} kcal/day)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <span className={`text-[10px] uppercase font-bold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              12-Wk Target
            </span>
            <span
              className={`text-sm font-black ${
                isLosing ? 'text-emerald-400' : isGaining ? 'text-amber-400' : 'text-blue-400'
              }`}
            >
              {endWeight} {unitLabel} ({netDiff > 0 ? `+${netDiff}` : netDiff} {unitLabel})
            </span>
          </div>
        </div>
      </div>

      <div className="h-48 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#232a38' : '#e2e8f0'}
              vertical={false}
            />
            <XAxis
              dataKey="week"
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              domain={['dataMin - 1', 'dataMax + 1']}
              stroke={isDark ? '#64748b' : '#94a3b8'}
              fontSize={10}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0f1219' : '#ffffff',
                borderColor: isDark ? '#272f3e' : '#cbd5e1',
                borderRadius: '12px',
                fontSize: '12px',
                color: isDark ? '#f8fafc' : '#0f172a',
              }}
              formatter={(val: any) => [`${val} ${unitLabel}`, 'Projected Weight']}
            />
            {targetDisplay && (
              <ReferenceLine
                y={targetDisplay}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{
                  value: `Goal: ${targetDisplay} ${unitLabel}`,
                  fill: '#10b981',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="weight"
              stroke={isLosing ? '#10b981' : isGaining ? '#f59e0b' : '#38bdf8'}
              strokeWidth={3}
              dot={{ r: 3, fill: isLosing ? '#10b981' : isGaining ? '#f59e0b' : '#38bdf8' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
