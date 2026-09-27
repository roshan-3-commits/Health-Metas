import React, { useState } from 'react';
import { ThemeMode } from '../types';
import {
  Mail,
  Send,
  CheckCircle2,
  HelpCircle,
  GraduationCap,
  Building2,
  Sparkles,
  IdCard,
  Laptop,
  Calendar,
  BadgeCheck,
  User,
  HeartHandshake
} from 'lucide-react';

interface ContactPageProps {
  theme: ThemeMode;
  onGoToFAQ: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ theme, onGoToFAQ }) => {
  const isDark = theme === 'dark';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Feedback / Suggestion');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn py-4">
      {/* Header */}
      <div className="text-center">
        <h1
          className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}
        >
          Feedback & Project Developer
        </h1>
      </div>

      {/* Project Owner & Creator Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border transition duration-300 relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-[#12151c] via-[#101217] to-[#0c0e12] border-[#222938] text-white shadow-xl'
            : 'bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border-slate-200 text-slate-900 shadow-md'
        }`}
      >
        {/* Subtle Ambient Accent Glow */}
        <div
          className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none ${
            isDark ? 'bg-blue-600/15' : 'bg-blue-400/20'
          }`}
        />
        <div
          className={`absolute -bottom-24 -left-24 w-60 h-60 rounded-full blur-3xl pointer-events-none ${
            isDark ? 'bg-amber-500/10' : 'bg-amber-400/15'
          }`}
        />

        <div className="relative z-10 space-y-6">
          {/* Top Bar with Creator Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-blue-500/10 text-blue-400 border-blue-500/25">
              <BadgeCheck className="w-4 h-4 text-blue-400" />
              <span>Project Owner &amp; Lead Developer</span>
            </div>
            <div className={`text-xs px-3 py-1 rounded-full font-medium border ${
              isDark ? 'bg-slate-800/80 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              Academic Capstone Project
            </div>
          </div>

          {/* Creator Profile Information */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-lg shrink-0">
              RL
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Roshan Lokhande
                </h2>
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  Creator
                </span>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Designed and developed <strong>Free Calorie Calculator</strong> — an intelligent, privacy-first metabolic and nutrition tracking platform engineered with real-time biometric equations, AI vision food scanning, circadian meal alarms, and local client-side persistence.
              </p>
            </div>
          </div>

          {/* Academic & College Credentials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Roll Number & Batch */}
            <div
              className={`p-3.5 rounded-2xl border transition ${
                isDark ? 'bg-[#171b24]/90 border-[#262f3f]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 mb-1">
                <IdCard className="w-4 h-4" />
                <span>Roll No. &amp; Batch</span>
              </div>
              <div className="font-extrabold text-sm sm:text-base">
                266597
              </div>
              <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Division / Batch: <strong>A3</strong>
              </div>
            </div>

            {/* Department */}
            <div
              className={`p-3.5 rounded-2xl border transition ${
                isDark ? 'bg-[#171b24]/90 border-[#262f3f]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
                <Laptop className="w-4 h-4" />
                <span>Department</span>
              </div>
              <div className="font-extrabold text-sm sm:text-base">
                Information Technology
              </div>
              <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Dept. of IT (B.Sc. I.T.)
              </div>
            </div>

            {/* Academic Year & Semester */}
            <div
              className={`p-3.5 rounded-2xl border transition ${
                isDark ? 'bg-[#171b24]/90 border-[#262f3f]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                <Calendar className="w-4 h-4" />
                <span>Academic Year</span>
              </div>
              <div className="font-extrabold text-sm sm:text-base">
                Final Year
              </div>
              <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Semester 5
              </div>
            </div>

            {/* College Name */}
            <div
              className={`p-3.5 rounded-2xl border transition ${
                isDark ? 'bg-[#171b24]/90 border-[#262f3f]' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
                <Building2 className="w-4 h-4" />
                <span>College / Institution</span>
              </div>
              <div className="font-extrabold text-xs sm:text-sm leading-tight line-clamp-2">
                Karmaveer Bhaurao Patil College
              </div>
              <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Vashi, Navi Mumbai
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Form Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border ${
          isDark ? 'bg-[#101216] border-[#1f242d] text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              <span>Send Feedback to Roshan</span>
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Your message will be reviewed to continuously refine the metabolic accuracy &amp; features.
            </p>
          </div>
          <span className={`hidden sm:inline-flex text-xs px-3 py-1 rounded-full border ${
            isDark ? 'bg-slate-800/60 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            Direct Developer Channel
          </span>
        </div>

        {isSubmitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">Thank you for your feedback!</h2>
            <p className={`text-xs sm:text-sm max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Your note has been received by <strong>Roshan Lokhande</strong>. We appreciate your insights to improve Free Calorie Calculator!
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setMessage('');
              }}
              className={`px-5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                isDark ? 'border-[#272d38] hover:bg-white/5 text-slate-300' : 'border-slate-200 bg-slate-50'
              }`}
            >
              Send Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul / Priya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border font-medium focus:outline-none ${
                    isDark
                      ? 'bg-[#161920] border-[#272d38] text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border font-medium focus:outline-none ${
                    isDark
                      ? 'bg-[#161920] border-[#272d38] text-white focus:border-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`block font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Topic
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border font-medium focus:outline-none appearance-none ${
                  isDark
                    ? 'bg-[#161920] border-[#272d38] text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'
                }`}
              >
                <option value="Feedback / Suggestion" className={isDark ? 'bg-[#161920]' : ''}>
                  Feedback / Suggestion
                </option>
                <option value="Calculation Question" className={isDark ? 'bg-[#161920]' : ''}>
                  Calculation Question
                </option>
                <option value="AI Food Scanner" className={isDark ? 'bg-[#161920]' : ''}>
                  AI Food Scanner
                </option>
                <option value="Project Collaboration" className={isDark ? 'bg-[#161920]' : ''}>
                  Project Collaboration
                </option>
                <option value="General Inquiry" className={isDark ? 'bg-[#161920]' : ''}>
                  General Inquiry
                </option>
              </select>
            </div>

            <div>
              <label className={`block font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Message <span className="text-blue-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Share your thoughts, feature requests, or queries with Roshan..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border font-medium focus:outline-none ${
                  isDark
                    ? 'bg-[#161920] border-[#272d38] text-white focus:border-blue-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-blue-500'
                }`}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={onGoToFAQ}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Frequently Asked Questions</span>
              </button>

              <button
                type="submit"
                className={`px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
                  isDark
                    ? 'bg-white text-slate-950 hover:bg-slate-100'
                    : 'bg-slate-950 text-white hover:bg-slate-800'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
