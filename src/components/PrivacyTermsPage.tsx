import React, { useState } from 'react';
import { ThemeMode } from '../types';
import { ShieldCheck, Lock, EyeOff, FileText, CheckCircle2, Server } from 'lucide-react';

interface PrivacyTermsPageProps {
  theme?: ThemeMode;
}

export const PrivacyTermsPage: React.FC<PrivacyTermsPageProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Surveillance • Privacy-First Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
          Privacy Policy &amp; Terms of Service
        </h1>
        <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Health Meta is engineered around mathematical transparency, edge computing, and complete user sovereignty over biometric health data.
        </p>

        {/* Tab Switcher */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              activeTab === 'privacy'
                ? isDark
                  ? 'bg-white text-slate-950 border-white'
                  : 'bg-slate-950 text-white border-slate-950'
                : isDark
                ? 'bg-[#141822] border-[#252c3d] text-slate-400 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition border cursor-pointer ${
              activeTab === 'terms'
                ? isDark
                  ? 'bg-white text-slate-950 border-white'
                  : 'bg-slate-950 text-white border-slate-950'
                : isDark
                ? 'bg-[#141822] border-[#252c3d] text-slate-400 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Terms of Service
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${
          isDark
            ? 'bg-[#10131a] border-[#1e2433] text-slate-300'
            : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        }`}
      >
        {activeTab === 'privacy' ? (
          <div className="space-y-6 text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                1. Local-First Biometric Storage
              </h2>
              <p>
                All your inputs—including age, gender, height, weight, activity levels, and daily logged meals—are stored primarily in your browser's private local storage space. We do not sell, broker, or monetize your health metrics to third-party ad networks.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-cyan-400" />
                2. AI Food Scanner &amp; Camera Permissions
              </h2>
              <p>
                When using the AI Food Scanner, camera access is requested purely to capture a temporary frame of your meal. The image is processed securely for optical nutrition decomposition and is never permanently archived on external databases or used to train third-party facial recognition models.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <Server className="w-5 h-5 text-amber-400" />
                3. Email Notifications &amp; Account Sign-In
              </h2>
              <p>
                Authentication services utilize Firebase Authentication (or local secure tokens). When welcome emails or scheduled nutrition alerts are dispatched, your email is used strictly for direct delivery from the creator's verified notification engine (<code className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">roshanlokhande43@gmail.com</code>). You can disable automated alerts at any time in your User Profile.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
                4. Data Deletion Rights
              </h2>
              <p>
                You retain full control over your data. Clicking "Clear Today's Meals", "Reset Biometrics", or clearing your browser cache immediately purges all stored records.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                1. Educational &amp; Informational Purpose Only
              </h2>
              <p>
                Health Meta, its Mifflin-St Jeor calculators, AI Food Scanner, and Real-Time Exercise Suggesters are designed solely for personal fitness education and macro tracking. They do not constitute formal clinical, medical, or dietary diagnoses. Always consult a qualified physician or registered dietitian before undertaking aggressive caloric deficits or novel exercise regimens.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                2. Algorithmic Accuracy Disclaimer
              </h2>
              <p>
                While our food scanner uses multi-tiered computer vision matching with high statistical accuracy, visual portion sizes can vary based on hidden cooking oils, sauces, and ingredient densities. Nutritional values should be treated as high-precision scientific estimates.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                3. Academic Project Attribution
              </h2>
              <p>
                Health Meta was designed and created by Roshan Lokhande (Roll No: 266597, A3 | Dept. of Information Technology, K.B.P. College Vashi). All rights reserved © 2026.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
