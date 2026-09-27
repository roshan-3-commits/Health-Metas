import React, { useState, useRef, useEffect } from 'react';
import { ThemeMode, NavPage } from '../types';
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Utensils,
  Dumbbell,
  User,
  LogOut,
  Flame,
  CheckCircle2,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  activePage: NavPage;
  setActivePage: React.Dispatch<React.SetStateAction<NavPage>> | ((pageId: NavPage) => void);
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  onOpenCalculator: () => void;
  onOpenStreak?: () => void;
  loggedMealsCount?: number;
  currentStreak?: number;
  userAvatar?: string;
  userName?: string;
  userPhotoUrl?: string;
  notificationsEnabled?: boolean;
  currentUser?: any;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
  isAuthLoading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  theme,
  setTheme,
  onOpenCalculator,
  onOpenStreak,
  loggedMealsCount = 0,
  currentStreak = 0,
  userName = 'Roshan Lokhande',
  userPhotoUrl = '',
  currentUser,
  onGoogleSignIn,
  onSignOut,
  isAuthLoading = false,
}) => {
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toolsDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId as NavPage);
    setToolsDropdownOpen(false);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(target)) {
        setToolsDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) {
        setProfileDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setToolsDropdownOpen(false);
        setProfileDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const displayName = currentUser?.displayName || userName || 'Member';
  const displayEmail = currentUser?.email || '';
  const displayPhoto = currentUser?.photoURL || userPhotoUrl || '';
  const initials = (displayName || 'U')
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  const navLinks = [
    { id: 'calculator', label: 'Calculator' },
    { id: 'methodology', label: 'Methodology' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-black/15 backdrop-blur-xl border-b border-white/[0.08] text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* ========================================================================= */}
        {/* LEFT: Clean Navigation Links                                              */}
        {/* ========================================================================= */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-6 lg:gap-8 text-[14px] font-medium"
        >
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => handleNavClick(link.id)}
                className={`transition-colors cursor-pointer ${
                  isActive ? 'text-white font-semibold' : 'text-[#8e8e93] hover:text-white'
                }`}
              >
                {link.label}
              </button>
            );
          })}

          {/* Tools Menu Trigger */}
          <div className="relative" ref={toolsDropdownRef}>
            <button
              type="button"
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                toolsDropdownOpen || ['scanner', 'tracker', 'exercise', 'profile'].includes(activePage)
                  ? 'text-white font-semibold'
                  : 'text-[#8e8e93] hover:text-white'
              }`}
            >
              <span>Tools</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  toolsDropdownOpen ? 'rotate-180 text-white' : 'opacity-70'
                }`}
              />
            </button>

            {/* Tools Popover */}
            {toolsDropdownOpen && (
              <div className="absolute left-0 mt-3 w-80 rounded-[16px] border border-white/[0.08] bg-[#141417]/85 p-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur-[16px] z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Header Section */}
                <div className="px-3 py-2 mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#8892b0]">
                    INTERACTIVE ENGINE
                  </span>
                  <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-zinc-700/50 to-zinc-600/30 text-zinc-300 border border-white/10 font-mono">
                    PRO
                  </span>
                </div>

                {/* Menu Items (List) */}
                <div className="flex flex-col gap-1">
                  {/* Item 1: AI Food Scanner */}
                  <button
                    type="button"
                    onClick={() => handleNavClick('scanner')}
                    className="w-full flex items-center gap-3 p-2 rounded-[8px] transition-colors duration-200 ease-out hover:bg-white/[0.05] cursor-pointer text-left group"
                  >
                    <div className="w-10 h-10 rounded-[10px] bg-white/[0.03] border border-white/[0.06] group-hover:border-cyan-400/40 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center justify-center shrink-0 transition-all duration-200 ease-out">
                      <Sparkles className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform duration-200 ease-out" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-white tracking-tight">
                          AI Food Scanner
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xs">
                          AI
                        </span>
                      </div>
                      <span className="text-[11px] text-[#8892b0] truncate">
                        Instant meal recognition
                      </span>
                    </div>
                  </button>

                  {/* Item 2: Daily Meal Log */}
                  <button
                    type="button"
                    onClick={() => handleNavClick('tracker')}
                    className="w-full flex items-center gap-3 p-2 rounded-[8px] transition-colors duration-200 ease-out hover:bg-white/[0.05] cursor-pointer text-left group"
                  >
                    <div className="w-10 h-10 rounded-[10px] bg-white/[0.03] border border-white/[0.06] group-hover:border-cyan-400/40 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center justify-center shrink-0 transition-all duration-200 ease-out">
                      <Utensils className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform duration-200 ease-out" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-white tracking-tight">
                          Daily Meal Log
                        </span>
                        {loggedMealsCount > 0 && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300">
                            {loggedMealsCount}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#8892b0] truncate">
                        Track calorie targets
                      </span>
                    </div>
                  </button>

                  {/* Item 3: Workouts & Burn */}
                  <button
                    type="button"
                    onClick={() => handleNavClick('exercise')}
                    className="w-full flex items-center gap-3 p-2 rounded-[8px] transition-colors duration-200 ease-out hover:bg-white/[0.05] cursor-pointer text-left group"
                  >
                    <div className="w-10 h-10 rounded-[10px] bg-white/[0.03] border border-white/[0.06] group-hover:border-cyan-400/40 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center justify-center shrink-0 transition-all duration-200 ease-out">
                      <Dumbbell className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform duration-200 ease-out" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[13px] font-bold text-white tracking-tight">
                        Workouts &amp; Burn
                      </span>
                      <span className="text-[11px] text-[#8892b0] truncate">
                        Calculate active MET burn
                      </span>
                    </div>
                  </button>

                  {/* Item 4: My Profile */}
                  <button
                    type="button"
                    onClick={() => handleNavClick('profile')}
                    className="w-full flex items-center gap-3 p-2 rounded-[8px] transition-colors duration-200 ease-out hover:bg-white/[0.05] cursor-pointer text-left group"
                  >
                    <div className="w-10 h-10 rounded-[10px] bg-white/[0.03] border border-white/[0.06] group-hover:border-cyan-400/40 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.25)] flex items-center justify-center shrink-0 transition-all duration-200 ease-out">
                      <User className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform duration-200 ease-out" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[13px] font-bold text-white tracking-tight">
                        My Profile
                      </span>
                      <span className="text-[11px] text-[#8892b0] truncate">
                        Biometrics &amp; targets
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile active page indicator */}
        <span className="md:hidden text-sm font-semibold tracking-tight text-white capitalize">
          {activePage}
        </span>

        {/* ========================================================================= */}
        {/* RIGHT: Streak + Log in + Vibrant Blue Pill Action Button                  */}
        {/* ========================================================================= */}
        <div className="flex items-center gap-3.5 sm:gap-4.5">
          {/* Streak Indicator (Only Fire Icon) */}
          {currentStreak > 0 && (
            <button
              type="button"
              onClick={() => {
                if (onOpenStreak) {
                  onOpenStreak();
                } else {
                  handleNavClick('tracker');
                  setTimeout(() => {
                    const el = document.getElementById('streak-section');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }
              }}
              className="p-1 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors cursor-pointer flex items-center justify-center active:scale-95"
              title={`${currentStreak} day streak - Click to open Streak Section`}
              aria-label={`${currentStreak} day streak`}
            >
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            </button>
          )}

          {/* Subtle Theme Toggle */}
          <button
            type="button"
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="text-[#8e8e93] hover:text-white transition-colors cursor-pointer p-1 rounded-lg"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-slate-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-800" />
            )}
          </button>

          {/* Profile or Log In Text Link */}
          {currentUser ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-white/20 transition-all cursor-pointer group"
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20 group-hover:border-white/50 transition-all">
                  {displayPhoto ? (
                    <img
                      src={displayPhoto}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#18181b] border border-white/10 text-white font-bold flex items-center justify-center text-xs">
                      {initials}
                    </div>
                  )}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#8e8e93] transition-transform duration-200 hidden sm:block ${
                    profileDropdownOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* Profile Popover Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/[0.08] bg-[#0c0d14]/98 p-2 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Hairline reflection */}
                  <div className="absolute top-0 inset-x-4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] mb-2 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0">
                      {displayPhoto ? (
                        <img
                          src={displayPhoto}
                          alt={displayName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#18181b] text-white font-bold flex items-center justify-center text-xs">
                          {initials}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate block">
                          {displayName}
                        </span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      </div>
                      <span className="text-[11px] text-zinc-400 truncate block">
                        {displayEmail}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleNavClick('profile')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:bg-white/[0.06] transition cursor-pointer text-left"
                    >
                      <User className="w-4 h-4 text-zinc-300 shrink-0" />
                      <span className="font-medium text-white">Biometrics &amp; Targets</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('tracker')}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:bg-white/[0.06] transition cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Utensils className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="font-medium text-white">Daily Meal Log</span>
                      </div>
                      {loggedMealsCount > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                          {loggedMealsCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('exercise')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-200 hover:bg-white/[0.06] transition cursor-pointer text-left"
                    >
                      <Dumbbell className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-medium text-white">Workouts &amp; Burn</span>
                    </button>
                  </div>

                  {onSignOut && (
                    <>
                      <div className="h-px bg-white/[0.08] my-1.5" />
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            onGoogleSignIn && (
              <button
                type="button"
                onClick={onGoogleSignIn}
                disabled={isAuthLoading}
                className="text-[14px] font-medium text-[#8e8e93] hover:text-white transition-colors cursor-pointer"
              >
                Log in
              </button>
            )
          )}

          {/* Vibrant Royal Blue Pill Button in Exact Screenshot Style */}
          <button
            type="button"
            onClick={() => {
              if (activePage !== 'calculator') {
                setActivePage('calculator');
              }
              onOpenCalculator();
            }}
            className="bg-[#0066FF] hover:bg-[#0052ea] text-white text-[14px] font-semibold px-4.5 py-1.5 rounded-full transition-all duration-150 hover:brightness-110 active:scale-95 cursor-pointer shadow-xs"
          >
            Calculate
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-[#8e8e93] hover:text-white transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 py-4 border-t border-[#18181b] bg-[#000000] space-y-2 animate-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleNavClick(link.id)}
              className={`w-full text-left py-2 px-3 rounded-xl text-sm font-semibold transition ${
                activePage === link.id
                  ? 'bg-white/10 text-white'
                  : 'text-[#8e8e93] hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </button>
          ))}

          <div className="pt-2 border-t border-white/10 space-y-2">
            {currentStreak > 0 && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenStreak) {
                    onOpenStreak();
                  } else {
                    handleNavClick('tracker');
                    setTimeout(() => {
                      const el = document.getElementById('streak-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }
                }}
                className="w-full text-left py-2 px-3 rounded-xl text-sm flex items-center justify-between hover:bg-white/10 text-amber-400 font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Streak Center</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                  {currentStreak}d Active
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleNavClick('scanner')}
              className="w-full text-left py-2 px-3 rounded-xl text-sm flex items-center gap-2 hover:bg-white/10 text-cyan-400 font-semibold"
            >
              <Sparkles className="w-4 h-4" />
              AI Food Scanner
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('tracker')}
              className="w-full text-left py-2 px-3 rounded-xl text-sm flex items-center gap-2 hover:bg-white/10 text-emerald-400 font-semibold"
            >
              <Utensils className="w-4 h-4" />
              Daily Meal Log {loggedMealsCount > 0 ? `(${loggedMealsCount})` : ''}
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('exercise')}
              className="w-full text-left py-2 px-3 rounded-xl text-sm flex items-center gap-2 hover:bg-white/10 text-teal-400 font-semibold"
            >
              <Dumbbell className="w-4 h-4" />
              Workouts &amp; Burn
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('profile')}
              className="w-full text-left py-2 px-3 rounded-xl text-sm flex items-center gap-2 hover:bg-white/10 text-slate-300 font-semibold"
            >
              <User className="w-4 h-4" />
              Profile &amp; Settings
            </button>

            {currentUser && onSignOut && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignOut();
                }}
                className="w-full text-left py-2 px-3 rounded-xl text-sm flex items-center gap-2 hover:bg-rose-500/10 text-rose-400 font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
