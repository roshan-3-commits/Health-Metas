import React, { useState } from 'react';
import { ThemeMode } from '../types';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'How accurate is the Mifflin-St Jeor equation?',
    a: 'Clinical trials evaluating metabolic prediction equations against indirect calorimetry have repeatedly confirmed Mifflin-St Jeor as the most reliable, predicting resting metabolic rate within 10% of measured values for over 82% of individuals.',
  },
  {
    q: 'What is the difference between BMR and TDEE?',
    a: 'BMR (Basal Metabolic Rate) is the baseline calories needed for essential organ function while sleeping/resting. TDEE (Total Daily Energy Expenditure) is your BMR multiplied by your physical activity multiplier, accounting for exercise, digestion, and daily motion.',
  },
  {
    q: 'Should I eat back workout calories tracked on my smart watch?',
    a: 'Generally no. Your activity factor (e.g. 1.55 for Moderately Active) already averages your workouts across the entire week. Eating back individual fitness tracker estimates frequently leads to accidental surpluses.',
  },
  {
    q: 'Why is protein higher during a calorie deficit (cutting)?',
    a: 'During a caloric deficit, higher protein intake (~35% of calories or ~2g per kg of bodyweight) signals muscle protein synthesis and protects lean muscle tissue from being catabolized for energy.',
  },
  {
    q: 'How does the AI Food Scanner work?',
    a: 'The scanner analyzes meal images using multimodal AI vision to estimate dish identity, portion sizing, and macronutrient breakdowns. You can snap a plate photo or select a pre-loaded sample meal.',
  },
  {
    q: 'Is my data collected or stored anywhere?',
    a: 'No. The calculator executes 100% on the client-side inside your browser sandbox. We require no signup, store zero tracking cookies, and collect no email addresses.',
  },
];

interface FAQPageProps {
  theme: ThemeMode;
}

export const FAQPage: React.FC<FAQPageProps> = ({ theme }) => {
  const isDark = theme === 'dark';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn py-4">
      <div className="text-center space-y-2">
        <span
          className={`text-xs uppercase tracking-widest font-bold block ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}
        >
          FAQ
        </span>
        <h1
          className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Frequently Asked Questions
        </h1>
        <p className={`text-sm max-w-lg mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Direct scientific answers regarding metabolism, deficits, macros, and tracking.
        </p>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isDark ? 'bg-[#101216] border-[#1f242d]' : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className={`w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base cursor-pointer ${
                  isDark ? 'text-white hover:text-blue-400' : 'text-slate-900 hover:text-blue-600'
                }`}
              >
                <span>{item.q}</span>
                <span
                  className={`p-1.5 rounded-lg border text-xs ${
                    isDark ? 'bg-[#161920] border-[#272d38] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div
                  className={`px-5 pb-5 pt-1 text-xs sm:text-sm leading-relaxed border-t ${
                    isDark
                      ? 'border-[#1a1e27] text-slate-300 bg-[#0d0e12]/60'
                      : 'border-slate-100 text-slate-600 bg-slate-50/50'
                  }`}
                >
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
