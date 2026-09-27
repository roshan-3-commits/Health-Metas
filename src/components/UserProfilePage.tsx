import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserProfile,
  NotificationSettings,
  NotificationLog,
  CustomReminder,
  Gender,
  ActivityLevel,
  PrimaryGoal,
  DietaryPreference,
  ThemeMode,
  LoggedMeal,
  LoggedExercise,
} from '../types';
import { RealtimeExerciseSuggester } from './RealtimeExerciseSuggester';
import {
  requestBrowserNotificationPermission,
  triggerDeviceNotification,
  playNotificationSound,
  generateEmailReport,
  openNativeEmailClient,
  openGmailWebDirect,
  openOutlookWebDirect,
  openWhatsAppGateway,
  openSmsGateway,
  sendRealEmailAlertApi,
} from '../utils/profileAndNotifications';
import {
  dispatchWelcomeEmail,
  getWelcomeEmailLogs,
  WelcomeDispatchLog,
} from '../lib/welcomeEmail';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Scale,
  Ruler,
  Activity,
  Target,
  Utensils,
  Bell,
  BellRing,
  BellOff,
  Clock,
  Droplets,
  Flame,
  Sparkles,
  Check,
  Save,
  RotateCcw,
  Smartphone,
  Volume2,
  VolumeX,
  Vibrate,
  AlertCircle,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Plus,
  Trash2,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Footprints,
  Heart,
  Send,
  Sliders,
  Award,
  MessageSquare,
  Copy,
  ExternalLink,
  Radio,
  Dumbbell,
} from 'lucide-react';

interface UserProfilePageProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  notificationSettings: NotificationSettings;
  onUpdateNotificationSettings: (updated: NotificationSettings) => void;
  notificationLogs: NotificationLog[];
  onClearNotificationLogs: () => void;
  theme?: ThemeMode;
  onGoToCalculator?: () => void;
  onGoToTracker?: () => void;
  meals?: LoggedMeal[];
  targetCalories?: number;
  onLogExercise?: (exercise: LoggedExercise) => void;
  currentUser?: any;
  onGoogleSignIn?: () => void;
  onSignOut?: () => void;
  isAuthLoading?: boolean;
}

const AVATAR_OPTIONS = ['🔥', '⚡', '💪', '🥗', '🎯', '👑', '🥑', '🦁', '🚀', '🧘‍♂️', '🏆', '💎'];

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  profile,
  onUpdateProfile,
  notificationSettings,
  onUpdateNotificationSettings,
  notificationLogs,
  onClearNotificationLogs,
  theme = 'dark',
  onGoToCalculator,
  onGoToTracker,
  meals = [],
  targetCalories = 2000,
  onLogExercise,
  currentUser,
  onGoogleSignIn,
  onSignOut,
  isAuthLoading = false,
}) => {
  const isDark = theme === 'dark';

  // Form State
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [notifData, setNotifData] = useState<NotificationSettings>(notificationSettings);
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'exercise' | 'dispatch' | 'notifications' | 'logs'>('profile');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [testNotifFeedback, setTestNotifFeedback] = useState<string | null>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Automated Welcome Email State (Sender: roshanlokhande43@gmail.com)
  const [isSendingWelcome, setIsSendingWelcome] = useState(false);
  const [welcomeSendResult, setWelcomeSendResult] = useState<{
    success: boolean;
    message: string;
    previewUrl?: string | null;
    transport?: string;
  } | null>(null);
  const [welcomeEmailLogs, setWelcomeEmailLogs] = useState<WelcomeDispatchLog[]>([]);

  useEffect(() => {
    setWelcomeEmailLogs(getWelcomeEmailLogs());
  }, []);

  // Email Server & SMTP State
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailDeliveryResult, setEmailDeliveryResult] = useState<{
    success: boolean;
    message: string;
    previewUrl?: string | null;
    transportType?: string;
  } | null>(null);
  const [showSmtpSettings, setShowSmtpSettings] = useState(false);
  const [smtpFormData, setSmtpFormData] = useState({
    host: notifData.smtpConfig?.host || '',
    port: notifData.smtpConfig?.port || 587,
    user: notifData.smtpConfig?.user || '',
    pass: notifData.smtpConfig?.pass || '',
    from: notifData.smtpConfig?.from || '',
  });
  const [smtpVerifying, setSmtpVerifying] = useState(false);
  const [smtpVerifyResult, setSmtpVerifyResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [newCustomReminder, setNewCustomReminder] = useState<Omit<CustomReminder, 'id'>>({
    title: '',
    message: '',
    time: '12:00',
    enabled: true,
    type: 'meal',
  });

  // Sync external changes into form state if props change
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  useEffect(() => {
    setNotifData(notificationSettings);
  }, [notificationSettings]);

  // Derived metrics (BMR & BMI)
  const heightM = (formData.heightCm || 175) / 100;
  const weight = formData.weightKg || 70;
  const calculatedBmi = Number((weight / (heightM * heightM)).toFixed(1));

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
    if (bmi < 25) return { label: 'Healthy Weight', color: 'text-emerald-400' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-400' };
    return { label: 'High BMI', color: 'text-rose-400' };
  };

  const bmiStatus = getBmiCategory(calculatedBmi);

  // Save all changes
  const handleSaveAll = () => {
    onUpdateProfile(formData);
    onUpdateNotificationSettings(notifData);
    setSaveFeedback('Profile, Meal Schedules & Notification channels saved and synced successfully!');
    playNotificationSound();
    setTimeout(() => setSaveFeedback(null), 3500);
  };

  // Request & Enable Browser Push Notification
  const handleEnablePushNotifications = async () => {
    const res = await requestBrowserNotificationPermission();
    if (res.granted) {
      const updated = { ...notifData, enabled: true, permissionGranted: true, devicePushEnabled: true };
      setNotifData(updated);
      onUpdateNotificationSettings(updated);
      setTestNotifFeedback('Device Push Notifications Granted! You will receive automatic screen alerts.');
      triggerDeviceNotification('🎉 Alerts Activated!', {
        body: `Hello ${formData.name || 'Friend'}! Your meal schedule & water alerts are now live.`,
        sound: true,
        vibrate: true,
      });
      setTimeout(() => setTestNotifFeedback(null), 4000);
    } else {
      setTestNotifFeedback(
        res.status === 'denied'
          ? 'Notification permission was denied in your browser settings. Please allow notifications in site settings.'
          : 'Web Notifications are in standard in-app simulation mode.'
      );
      setTimeout(() => setTestNotifFeedback(null), 5000);
    }
  };

  // Test Instant Device Notification
  const handleSendTestNotification = () => {
    const titles = [
      `🥗 Time for Meal Window! (${formData.name || 'Champion'})`,
      '💧 Hydration Alert: Drink a glass of water!',
      '🔥 Streak Alert: Keep your consistency alive today!',
      '⚡ Metabolism Boost: Time for a healthy snack!',
    ];
    const bodies = [
      `Scheduled reminder: Remember to hit your ${formData.goal} goal today.`,
      `Target: ${formData.dailyWaterTargetLiters}L today. Stay energetic and hydrated!`,
      `Log your meals before 09:30 PM to keep your streak growing!`,
      `High-protein intake fuels your active metabolism.`,
    ];

    const randomIndex = Math.floor(Math.random() * titles.length);
    const chosenTitle = titles[randomIndex];
    const chosenBody = bodies[randomIndex];

    playNotificationSound();
    const sent = triggerDeviceNotification(chosenTitle, {
      body: chosenBody,
      sound: notifData.soundEnabled,
      vibrate: notifData.vibrationEnabled,
    });

    if (sent) {
      setTestNotifFeedback(`🔔 Push Notification delivered directly to your device screen!`);
    } else {
      setTestNotifFeedback(
        `🔔 Notification sound chime & vibration triggered! (Enable phone push permission for lock screen popups).`
      );
    }
    setTimeout(() => setTestNotifFeedback(null), 4500);
  };

  // Send Real Server-Side Email using backend API (/api/send-email-alert)
  const handleSendRealServerEmail = async () => {
    setIsSendingEmail(true);
    setEmailDeliveryResult(null);

    const report = generateEmailReport(
      formData,
      'Circadian Meal Schedule & Nutrition Targets',
      `This is your scheduled daily nutrition alert for ${new Date().toLocaleDateString()}. Follow your personalized circadian meal windows and stay hydrated!`
    );

    try {
      const res = await sendRealEmailAlertApi(
        formData,
        report.subject,
        report.body,
        'manual_dispatch',
        notifData.smtpConfig
      );

      if (res.success) {
        setEmailDeliveryResult({
          success: true,
          message: `Email alert successfully processed! Message ID: ${res.messageId || 'DELIVERED'}`,
          previewUrl: res.previewUrl,
          transportType: res.transportType,
        });
        setDispatchStatus(`✅ Email alert dispatched to ${formData.email || 'pj344504@gmail.com'}`);
      } else {
        setEmailDeliveryResult({
          success: false,
          message: res.error || 'Failed to dispatch email. Check SMTP settings or connection.',
        });
        setDispatchStatus(`⚠️ Email dispatch alert: ${res.error || 'Check server configuration'}`);
      }
    } catch (err: any) {
      setEmailDeliveryResult({
        success: false,
        message: err?.message || 'Network error reaching backend email dispatcher',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Dispatch / Test Welcome Email from roshanlokhande43@gmail.com
  const handleSendWelcomeEmail = async () => {
    const targetEmail = formData.email || currentUser?.email || 'member@calai.app';
    const targetName = formData.name || currentUser?.displayName || 'Fitness Champion';

    setIsSendingWelcome(true);
    setWelcomeSendResult(null);

    try {
      const res = await dispatchWelcomeEmail({
        toEmail: targetEmail,
        userName: targetName,
        force: true,
      });

      setWelcomeSendResult({
        success: res.success,
        message: res.message,
        previewUrl: res.previewUrl,
        transport: res.transport,
      });
      setWelcomeEmailLogs(getWelcomeEmailLogs());
      setDispatchStatus(`✉️ Welcome email dispatched to ${targetEmail} from roshanlokhande43@gmail.com!`);
      setTimeout(() => setDispatchStatus(null), 5000);
    } catch (err: any) {
      setWelcomeSendResult({
        success: false,
        message: err?.message || 'Failed to dispatch welcome email',
      });
    } finally {
      setIsSendingWelcome(false);
    }
  };

  // Open Directly in Gmail Web (1-Click Compose)
  const handleOpenGmailWeb = () => {
    const report = generateEmailReport(
      formData,
      'Circadian Meal Windows & Nutrition Plan',
      `Personalized daily nutrition & meal reminder for ${new Date().toLocaleDateString()}. Stay consistent and fuel your health!`
    );
    openGmailWebDirect(formData.email || 'pj344504@gmail.com', report.subject, report.body);
    setDispatchStatus(`📧 Gmail Web composer opened for ${formData.email || 'pj344504@gmail.com'}`);
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  // Open in Outlook Web
  const handleOpenOutlookWeb = () => {
    const report = generateEmailReport(
      formData,
      'Circadian Meal Windows & Nutrition Plan',
      `Personalized daily nutrition & meal reminder for ${new Date().toLocaleDateString()}. Stay consistent and fuel your health!`
    );
    openOutlookWebDirect(formData.email || 'pj344504@gmail.com', report.subject, report.body);
    setDispatchStatus(`📧 Outlook Web composer opened for ${formData.email || 'pj344504@gmail.com'}`);
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  // Real Email Dispatch Action (Mailto / Native)
  const handleSendEmailAlert = () => {
    const report = generateEmailReport(
      formData,
      'Scheduled Meal & Nutrition Targets',
      `This is your scheduled daily nutrition alert for ${new Date().toLocaleDateString()}. Follow your circadian meal windows and stay hydrated!`
    );
    openNativeEmailClient(formData.email || 'pj344504@gmail.com', report.subject, report.body);
    setDispatchStatus(`📧 Real Email Dispatch triggered for ${formData.email || 'pj344504@gmail.com'}`);
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  // Verify SMTP settings against backend API
  const handleVerifySmtpCredentials = async () => {
    if (!smtpFormData.host || !smtpFormData.user) {
      setSmtpVerifyResult({
        success: false,
        message: 'Please provide at least SMTP Host and User email.',
      });
      return;
    }

    setSmtpVerifying(true);
    setSmtpVerifyResult(null);

    try {
      const res = await fetch('/api/verify-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpFormData),
      });
      const data = await res.json();
      setSmtpVerifyResult({
        success: data.success,
        message: data.message || (data.success ? 'SMTP connection verified successfully!' : 'SMTP verification failed.'),
      });
    } catch (err: any) {
      setSmtpVerifyResult({
        success: false,
        message: err?.message || 'Failed to connect to SMTP verification endpoint',
      });
    } finally {
      setSmtpVerifying(false);
    }
  };

  // Save SMTP Settings
  const handleSaveSmtpSettings = () => {
    const updatedSmtp = {
      ...smtpFormData,
      port: Number(smtpFormData.port) || 587,
      isCustomConfigured: Boolean(smtpFormData.host && smtpFormData.user),
    };
    const updatedNotif = {
      ...notifData,
      smtpConfig: updatedSmtp,
    };
    setNotifData(updatedNotif);
    onUpdateNotificationSettings(updatedNotif);
    setDispatchStatus('✅ SMTP configuration saved to notification settings!');
    setTimeout(() => setDispatchStatus(null), 4000);
  };

  // Copy Email Report Text
  const handleCopyEmailReport = () => {
    const report = generateEmailReport(formData, 'Daily Nutrition & Meal Windows');
    navigator.clipboard.writeText(`Subject: ${report.subject}\n\n${report.body}`);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  // Real WhatsApp / Mobile SMS Alert Action
  const handleSendWhatsAppAlert = () => {
    const alertMessage = `🔥 *FreeCalorieCalc Mobile Alert for ${formData.name}*\n\n⏰ *Time for Scheduled Meal/Hydration Window!*\n• Goal: ${formData.goal.toUpperCase()} (${formData.targetWeightKg}kg target)\n• Water Target: ${formData.dailyWaterTargetLiters}L\n• Meal Windows: Breakfast ${formData.breakfastTime} | Lunch ${formData.lunchTime} | Snack ${formData.snackTime} | Dinner ${formData.dinnerTime}\n\nStay consistent and log your meal today! 💪`;
    openWhatsAppGateway(formData.phone || '+919876543210', alertMessage);
    setDispatchStatus(`💬 WhatsApp alert trigger opened for ${formData.phone || '+91 98765 43210'}`);
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  // Real SMS App Action
  const handleSendSmsAlert = () => {
    const alertMessage = `[FreeCalorieCalc] Time for meal/hydration window! Target: ${formData.dailyWaterTargetLiters}L water. Log your meal now to keep your streak!`;
    openSmsGateway(formData.phone || '+919876543210', alertMessage);
    setDispatchStatus(`📱 SMS dispatcher opened for ${formData.phone || '+91 98765 43210'}`);
    setTimeout(() => setDispatchStatus(null), 5000);
  };

  // Simultaneous Multichannel Dispatch Test (Push + Email + WhatsApp)
  const handleSimultaneousMultichannelTest = () => {
    playNotificationSound();
    triggerDeviceNotification(`🚀 Multichannel Dispatch (${formData.name})`, {
      body: `Testing Push, Email to ${formData.email} and SMS/WhatsApp to ${formData.phone}!`,
      sound: true,
      vibrate: true,
    });
    setDispatchStatus(`⚡ Multichannel Alert Fired: Device Push + Email (${formData.email}) + WhatsApp (${formData.phone})`);
    setTimeout(() => setDispatchStatus(null), 6000);
  };

  // Add custom reminder
  const handleAddCustomReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomReminder.title.trim()) return;

    const newReminder: CustomReminder = {
      ...newCustomReminder,
      id: 'custom_' + Date.now(),
    };

    const updated = {
      ...notifData,
      customReminders: [...(notifData.customReminders || []), newReminder],
    };
    setNotifData(updated);
    onUpdateNotificationSettings(updated);
    setShowCustomModal(false);
    setNewCustomReminder({
      title: '',
      message: '',
      time: '12:00',
      enabled: true,
      type: 'meal',
    });
  };

  const handleRemoveCustomReminder = (id: string) => {
    const updated = {
      ...notifData,
      customReminders: notifData.customReminders.filter((r) => r.id !== id),
    };
    setNotifData(updated);
    onUpdateNotificationSettings(updated);
  };

  const handleToggleCustomReminder = (id: string) => {
    const updated = {
      ...notifData,
      customReminders: notifData.customReminders.map((r) =>
        r.id === id ? { ...r, enabled: !r.enabled } : r
      ),
    };
    setNotifData(updated);
    onUpdateNotificationSettings(updated);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. HERO USER PROFILE CARD                                                 */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border border-white/[0.05] bg-[rgba(20,20,25,0.8)] backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Circular Avatar with subtle 1px border and no glitchy champion text */}
            <div className="relative shrink-0">
              {formData.photoUrl ? (
                <img
                  src={formData.photoUrl}
                  alt={formData.name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-white/10 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#222838] to-[#121622] border border-white/10 flex items-center justify-center text-xl sm:text-2xl font-bold text-white shadow-md select-none tracking-wider">
                  {formData.name
                    ? formData.name
                        .trim()
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'RL'}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {formData.name || 'Roshan Lokhande'}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[#A0AEC0]">
                {formData.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{formData.email}</span>
                  </span>
                )}
                {formData.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{formData.phone}</span>
                  </span>
                )}
              </div>

              {/* Refined Pill Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[rgba(255,152,0,0.12)] border border-[rgba(255,152,0,0.25)] text-[#ff9800]">
                  Goal: {formData.goal.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.25)] text-[#34d399]">
                  BMI {calculatedBmi} ({bmiStatus.label})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Vertically Centered with consistent gap) */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 self-start md:self-center">
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <span className="text-xs px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Google Linked
                </span>
                {onSignOut && (
                  <button
                    type="button"
                    onClick={onSignOut}
                    className="px-3.5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-slate-200 text-xs font-bold transition-all cursor-pointer border border-white/10"
                  >
                    Sign Out
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onGoogleSignIn}
                disabled={isAuthLoading}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#121212] font-bold text-xs transition-all shadow-sm flex items-center gap-2.5 cursor-pointer border border-slate-200 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isAuthLoading ? 'Connecting...' : 'Sign In with Google'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2.5 rounded-xl bg-[#ff9800] hover:bg-[#fb8c00] text-slate-950 font-black text-xs transition-all shadow-[0_4px_14px_rgba(255,152,0,0.3)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Feedback banners */}
        {saveFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveFeedback}</span>
          </motion.div>
        )}

        {testNotifFeedback && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center gap-2"
          >
            <BellRing className="w-4 h-4 text-cyan-400 shrink-0 animate-bounce" />
            <span>{testNotifFeedback}</span>
          </motion.div>
        )}

        {dispatchStatus && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center gap-2"
          >
            <Send className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{dispatchStatus}</span>
          </motion.div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION TABS                                                     */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0c1017] border border-[#1b2230] max-w-fit overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-[#ff9800] text-slate-950 shadow-md'
              : 'bg-[#121722] text-teal-400 hover:text-teal-300 border border-teal-500/20'
          }`}
        >
          <User className={`w-3.5 h-3.5 ${activeTab === 'profile' ? 'text-slate-950' : 'text-teal-400'}`} />
          <span>Biometrics &amp; Goal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-[#ff9800] text-slate-950 shadow-md font-black'
              : 'bg-[#121722] text-teal-400 hover:text-teal-300 border border-teal-500/20'
          }`}
        >
          <Clock className={`w-3.5 h-3.5 ${activeTab === 'schedule' ? 'text-slate-950' : 'text-teal-400'}`} />
          <span>Meal Times &amp; Water</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('exercise')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'exercise'
              ? 'bg-[#ff9800] text-slate-950 shadow-md font-black'
              : 'bg-[#121722] text-teal-400 hover:text-teal-300 border border-teal-500/20'
          }`}
        >
          <Dumbbell className={`w-3.5 h-3.5 ${activeTab === 'exercise' ? 'text-slate-950' : 'text-teal-400'}`} />
          <span>Real-Time Exercise Engine</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB 1: BIOMETRICS & PERSONAL PROFILE                                   */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="rounded-3xl p-6 sm:p-8 border border-white/[0.05] bg-[rgba(20,20,25,0.8)] backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] text-white space-y-6 animate-fadeIn">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(255,152,0,0.12)] border border-[rgba(255,152,0,0.25)] flex items-center justify-center text-[#ff9800] shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">Biometrics &amp; Personal Profile</h2>
                <p className="text-xs text-[#A0AEC0]">Fine-tune your personal metrics, targets, and metabolic calculations</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Synced
            </span>
          </div>

          {/* Group 1: Account & Identity (Vertical List) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>Account &amp; Contact</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </h3>

            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 sm:p-5 divide-y divide-white/[0.05]">
              {/* Full Name Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-white/50" />
                    <span className="text-sm font-semibold text-white">Full Name</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0]">Display name shown across calorie dashboards and meal receipts</p>
                </div>
                <div className="w-full sm:w-80">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181d] border border-white/[0.08] text-sm text-white font-medium hover:border-white/[0.16] focus:border-[#ff9800] focus:ring-1 focus:ring-[#ff9800] transition-all outline-none"
                  />
                </div>
              </div>

              {/* Email Address Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400/80" />
                    <span className="text-sm font-semibold text-white">Email Address</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0]">Receives automated nutrition summaries and circadian alerts</p>
                </div>
                <div className="w-full sm:w-80">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181d] border border-white/[0.08] text-sm text-white font-medium hover:border-white/[0.16] focus:border-[#ff9800] focus:ring-1 focus:ring-[#ff9800] transition-all outline-none"
                  />
                </div>
              </div>

              {/* Mobile Phone Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#ff9800]/80" />
                    <span className="text-sm font-semibold text-white">Mobile Phone</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0]">For direct SMS or WhatsApp meal windows and hydration pings</p>
                </div>
                <div className="w-full sm:w-80">
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181d] border border-white/[0.08] text-sm text-white font-medium hover:border-white/[0.16] focus:border-[#ff9800] focus:ring-1 focus:ring-[#ff9800] transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Group 2: Physical Biometrics (Vertical List) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>Physical Biometrics</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </h3>

            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 sm:p-5 divide-y divide-white/[0.05]">
              {/* Gender Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-white/50" />
                    <span className="text-sm font-semibold text-white">Biological Gender</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0]">Select biological sex for baseline Mifflin-St Jeor metabolic expenditure</p>
                </div>
                <div className="w-full sm:w-80">
                  <div className="flex p-1 rounded-xl bg-[#141419] border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'male' })}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        formData.gender === 'male'
                          ? 'bg-[#ff9800] text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      MALE
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: 'female' })}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        formData.gender === 'female'
                          ? 'bg-[#ff9800] text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      FEMALE
                    </button>
                  </div>
                </div>
              </div>

              {/* Age Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400/80" />
                    <span className="text-sm font-semibold text-white">Age</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0]">Chronological age in years used to calculate resting metabolic rate</p>
                </div>
                <div className="w-full sm:w-80 flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) || 25 })}
                    min={10}
                    max={120}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181d] border border-white/[0.08] text-sm text-white font-medium hover:border-white/[0.16] focus:border-[#ff9800] focus:ring-1 focus:ring-[#ff9800] transition-all outline-none"
                  />
                  <span className="text-xs font-semibold text-slate-400 bg-white/[0.04] px-3 py-2.5 rounded-xl border border-white/[0.08]">
                    Years
                  </span>
                </div>
              </div>

              {/* Height Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-teal-400/80" />
                    <span className="text-sm font-semibold text-white">Height</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0]">Stature in centimeters for Body Mass Index and energy coefficients</p>
                </div>
                <div className="w-full sm:w-80 flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) || 170 })}
                    min={80}
                    max={250}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181d] border border-white/[0.08] text-sm text-white font-medium hover:border-white/[0.16] focus:border-[#ff9800] focus:ring-1 focus:ring-[#ff9800] transition-all outline-none"
                  />
                  <span className="text-xs font-semibold text-slate-400 bg-white/[0.04] px-3.5 py-2.5 rounded-xl border border-white/[0.08]">
                    CM
                  </span>
                </div>
              </div>

              {/* Current Weight Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-rose-400/80" />
                    <span className="text-sm font-semibold text-white">Current Weight</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0]">Your baseline body weight in kilograms right now</p>
                </div>
                <div className="w-full sm:w-80 flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) || 70 })}
                    min={30}
                    max={300}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181d] border border-white/[0.08] text-sm text-white font-medium hover:border-white/[0.16] focus:border-[#ff9800] focus:ring-1 focus:ring-[#ff9800] transition-all outline-none"
                  />
                  <span className="text-xs font-semibold text-slate-400 bg-white/[0.04] px-3.5 py-2.5 rounded-xl border border-white/[0.08]">
                    KG
                  </span>
                </div>
              </div>

              {/* Target Goal Weight Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-400/80" />
                    <span className="text-sm font-semibold text-white">Target Goal Weight</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0]">Goal body weight used to project completion timeline and pace</p>
                </div>
                <div className="w-full sm:w-80 flex items-center gap-2">
                  <input
                    type="number"
                    value={formData.targetWeightKg}
                    onChange={(e) => setFormData({ ...formData, targetWeightKg: Number(e.target.value) || 65 })}
                    min={30}
                    max={300}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181d] border border-white/[0.08] text-sm text-white font-medium hover:border-white/[0.16] focus:border-[#ff9800] focus:ring-1 focus:ring-[#ff9800] transition-all outline-none"
                  />
                  <span className="text-xs font-semibold text-slate-400 bg-white/[0.04] px-3.5 py-2.5 rounded-xl border border-white/[0.08]">
                    KG
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Group 3: Nutrition & Fitness Strategy (Vertical List) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>Nutrition &amp; Fitness Strategy</span>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </h3>

            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4 sm:p-5 divide-y divide-white/[0.05]">
              {/* Primary Goal Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#ff9800]/80" />
                    <span className="text-sm font-semibold text-white">Primary Goal</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0]">Calorie deficit for fat loss, surplus for muscle bulk, or steady maintenance</p>
                </div>
                <div className="w-full sm:w-80">
                  <select
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value as PrimaryGoal })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181d] border border-white/[0.08] text-sm text-white font-medium hover:border-white/[0.16] focus:border-[#ff9800] focus:ring-1 focus:ring-[#ff9800] transition-all outline-none cursor-pointer"
                  >
                    <option value="lose" className="bg-[#121212] text-white">Fat Loss &amp; Lean Out</option>
                    <option value="maintain" className="bg-[#121212] text-white">Maintain Current Physique</option>
                    <option value="gain" className="bg-[#121212] text-white">Muscle Gain &amp; Bulking</option>
                  </select>
                </div>
              </div>

              {/* Activity Level Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400/80" />
                    <span className="text-sm font-semibold text-white">Daily Activity Level</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0]">Activity multiplier added onto your baseline metabolic expenditure</p>
                </div>
                <div className="w-full sm:w-80">
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181d] border border-white/[0.08] text-sm text-white font-medium hover:border-white/[0.16] focus:border-[#ff9800] focus:ring-1 focus:ring-[#ff9800] transition-all outline-none cursor-pointer"
                  >
                    <option value="sedentary" className="bg-[#121212] text-white">Sedentary (Desk job, little exercise)</option>
                    <option value="light" className="bg-[#121212] text-white">Light Activity (1–3 training days/wk)</option>
                    <option value="moderate" className="bg-[#121212] text-white">Moderate Activity (3–5 training days/wk)</option>
                    <option value="very" className="bg-[#121212] text-white">Very Active (6–7 heavy workout days/wk)</option>
                    <option value="extra" className="bg-[#121212] text-white">Extremely Active (Athletic / physical job)</option>
                  </select>
                </div>
              </div>

              {/* Dietary Preference Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-emerald-400/80" />
                    <span className="text-sm font-semibold text-white">Dietary Preference</span>
                  </div>
                  <p className="text-xs text-[#A0AEC0]">Calibrates macro distribution (protein, carbs, fats) to your eating style</p>
                </div>
                <div className="w-full sm:w-80">
                  <select
                    value={formData.dietaryPreference}
                    onChange={(e) => setFormData({ ...formData, dietaryPreference: e.target.value as DietaryPreference })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181d] border border-white/[0.08] text-sm text-white font-medium hover:border-white/[0.16] focus:border-[#ff9800] focus:ring-1 focus:ring-[#ff9800] transition-all outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-[#121212] text-white">Standard / All Foods</option>
                    <option value="high-protein" className="bg-[#121212] text-white">High-Protein Fitness Diet</option>
                    <option value="vegetarian" className="bg-[#121212] text-white">Vegetarian (Lacto/Ovo)</option>
                    <option value="eggetarian" className="bg-[#121212] text-white">Eggetarian</option>
                    <option value="non-veg" className="bg-[#121212] text-white">Non-Vegetarian</option>
                    <option value="vegan" className="bg-[#121212] text-white">100% Plant-Based Vegan</option>
                    <option value="keto" className="bg-[#121212] text-white">Ketogenic (Low-Carb High-Fat)</option>
                    <option value="gluten-free" className="bg-[#121212] text-white">Gluten-Free</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB 2: MEAL TIMING SCHEDULE & HYDRATION                                */}
      {/* ========================================================================= */}
      {activeTab === 'schedule' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-[#19202c] bg-[#0c1017] space-y-6 text-white">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f2838]">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-black tracking-tight">Time-to-Time Meal Windows &amp; Hydration</h2>
            </div>
            <span className="text-xs text-slate-400">Sets your custom circadian notification triggers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Breakfast Time */}
            <div className="p-4 rounded-2xl bg-[#111622] border border-[#1d2637] space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase">
                <Sunrise className="w-4 h-4" />
                <span>Morning Fuel (Breakfast)</span>
              </div>
              <input
                type="time"
                value={formData.breakfastTime}
                onChange={(e) => setFormData({ ...formData, breakfastTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161d2a] border border-[#27354a] text-white text-base font-bold"
              />
              <span className="text-[11px] text-slate-400 block">Metabolic ignition alert time</span>
            </div>

            {/* Lunch Time */}
            <div className="p-4 rounded-2xl bg-[#111622] border border-[#1d2637] space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase">
                <Sun className="w-4 h-4" />
                <span>Midday Power (Lunch)</span>
              </div>
              <input
                type="time"
                value={formData.lunchTime}
                onChange={(e) => setFormData({ ...formData, lunchTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161d2a] border border-[#27354a] text-white text-base font-bold"
              />
              <span className="text-[11px] text-slate-400 block">Peak insulin efficiency window</span>
            </div>

            {/* Snack Time */}
            <div className="p-4 rounded-2xl bg-[#111622] border border-[#1d2637] space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase">
                <Zap className="w-4 h-4" />
                <span>Afternoon Refuel (Snack)</span>
              </div>
              <input
                type="time"
                value={formData.snackTime}
                onChange={(e) => setFormData({ ...formData, snackTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161d2a] border border-[#27354a] text-white text-base font-bold"
              />
              <span className="text-[11px] text-slate-400 block">Pre-workout energy buffer</span>
            </div>

            {/* Dinner Time */}
            <div className="p-4 rounded-2xl bg-[#111622] border border-[#1d2637] space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase">
                <Sunset className="w-4 h-4" />
                <span>Rest &amp; Repair (Dinner)</span>
              </div>
              <input
                type="time"
                value={formData.dinnerTime}
                onChange={(e) => setFormData({ ...formData, dinnerTime: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#161d2a] border border-[#27354a] text-white text-base font-bold"
              />
              <span className="text-[11px] text-slate-400 block">Finish 3h prior to sleep</span>
            </div>
          </div>

          {/* Hydration & Sleep Protocol Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#111622] border border-[#1d2637] space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <Droplets className="w-4 h-4" />
                <span>Daily Water Goal (Liters)</span>
              </div>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                value={formData.dailyWaterTargetLiters}
                onChange={(e) =>
                  setFormData({ ...formData, dailyWaterTargetLiters: Number(e.target.value) || 3 })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#161d2a] border border-[#27354a] text-white text-base font-bold"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#111622] border border-[#1d2637] space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                <Droplets className="w-4 h-4" />
                <span>Water Reminder Interval</span>
              </div>
              <select
                value={formData.waterReminderIntervalHours}
                onChange={(e) =>
                  setFormData({ ...formData, waterReminderIntervalHours: Number(e.target.value) || 2 })
                }
                className="w-full px-3 py-2 rounded-xl bg-[#161d2a] border border-[#27354a] text-white text-sm font-bold"
              >
                <option value={1}>Every 1 Hour</option>
                <option value={2}>Every 2 Hours (Recommended)</option>
                <option value={3}>Every 3 Hours</option>
                <option value={4}>Every 4 Hours</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-[#111622] border border-[#1d2637] space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <Footprints className="w-4 h-4" />
                <span>Daily Step Target</span>
              </div>
              <input
                type="number"
                step="1000"
                min="2000"
                max="50000"
                value={formData.dailyStepGoal}
                onChange={(e) => setFormData({ ...formData, dailyStepGoal: Number(e.target.value) || 10000 })}
                className="w-full px-3 py-2 rounded-xl bg-[#161d2a] border border-[#27354a] text-white text-base font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 3: REAL-TIME EXERCISE SUGGESTIONS & WORKOUT ENGINE                 */}
      {/* ========================================================================= */}
      {activeTab === 'exercise' && (
        <RealtimeExerciseSuggester
          weightKg={formData.weightKg || profile.weightKg || 70}
          goal={formData.goal || profile.goal || 'lose'}
          totalCaloriesLoggedToday={meals.reduce((sum, m) => sum + m.calories, 0)}
          targetCalories={targetCalories || 2000}
          mealsLogged={meals}
          theme={theme}
          onLogExercise={onLogExercise}
          onGoToTracker={onGoToTracker}
        />
      )}
      {activeTab === 'notifications' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-[#19202c] bg-[#0c1017] space-y-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f2838]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-tight">Time-to-Time Mobile Push Engine</h2>
                <p className="text-xs text-slate-400">
                  Sends scheduled alerts to your mobile phone screen, email &amp; SMS channels.
                </p>
              </div>
            </div>

            {/* Permission Action */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEnablePushNotifications}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Smartphone className="w-4 h-4" />
                <span>Grant Phone Permission</span>
              </button>

              <button
                type="button"
                onClick={handleSendTestNotification}
                className="px-4 py-2 rounded-xl bg-[#151c27] hover:bg-[#1e2736] border border-[#29364a] text-slate-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Alert</span>
              </button>
            </div>
          </div>

          {/* Master Channel Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Global Enable */}
            <div className="p-4 rounded-2xl bg-[#121722] border border-[#222c3d] flex items-center justify-between">
              <div>
                <span className="font-bold text-sm block">Push Alerts</span>
                <span className="text-[11px] text-slate-400">Mobile &amp; Browser</span>
              </div>
              <input
                type="checkbox"
                checked={notifData.devicePushEnabled}
                onChange={(e) => setNotifData({ ...notifData, devicePushEnabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Email Alerts */}
            <div className="p-4 rounded-2xl bg-[#121722] border border-[#222c3d] flex items-center justify-between">
              <div>
                <span className="font-bold text-sm block">Email Delivery</span>
                <span className="text-[11px] text-slate-400">{formData.email ? 'To your inbox' : 'Disabled'}</span>
              </div>
              <input
                type="checkbox"
                checked={notifData.emailAlertsEnabled}
                onChange={(e) => setNotifData({ ...notifData, emailAlertsEnabled: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* WhatsApp / SMS Alerts */}
            <div className="p-4 rounded-2xl bg-[#121722] border border-[#222c3d] flex items-center justify-between">
              <div>
                <span className="font-bold text-sm block">Mobile WhatsApp/SMS</span>
                <span className="text-[11px] text-slate-400">To {formData.phone || 'Phone'}</span>
              </div>
              <input
                type="checkbox"
                checked={notifData.whatsappAlertsEnabled || notifData.smsAlertsEnabled}
                onChange={(e) =>
                  setNotifData({
                    ...notifData,
                    whatsappAlertsEnabled: e.target.checked,
                    smsAlertsEnabled: e.target.checked,
                  })
                }
                className="w-5 h-5 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Sound Chimes */}
            <div className="p-4 rounded-2xl bg-[#121722] border border-[#222c3d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <div>
                  <span className="font-bold text-sm block">Audio Chime</span>
                  <span className="text-[11px] text-slate-400">Harmonic Bell</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifData.soundEnabled}
                onChange={(e) => setNotifData({ ...notifData, soundEnabled: e.target.checked })}
                className="w-5 h-5 accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Time-to-Time Scheduled Reminder Toggles */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              Automated Meal &amp; Health Reminder Triggers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Morning Breakfast Reminder */}
              <div className="p-4 rounded-2xl bg-[#121722] border border-[#222c3d] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Sunrise className="w-4 h-4" />
                    <span>Morning Fuel Reminder ({formData.breakfastTime})</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Alerts you to consume your high-protein breakfast within 1–2 hours of waking up.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifData.breakfastReminder}
                  onChange={(e) => setNotifData({ ...notifData, breakfastReminder: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 cursor-pointer mt-1"
                />
              </div>

              {/* Lunch Reminder */}
              <div className="p-4 rounded-2xl bg-[#121722] border border-[#222c3d] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Sun className="w-4 h-4" />
                    <span>Midday Lunch Reminder ({formData.lunchTime})</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Prompts balanced energy refuel to prevent afternoon brain fog and blood sugar dips.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifData.lunchReminder}
                  onChange={(e) => setNotifData({ ...notifData, lunchReminder: e.target.checked })}
                  className="w-5 h-5 accent-cyan-500 cursor-pointer mt-1"
                />
              </div>

              {/* Afternoon Refuel Reminder */}
              <div className="p-4 rounded-2xl bg-[#121722] border border-[#222c3d] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                    <Zap className="w-4 h-4" />
                    <span>Afternoon Refuel ({formData.snackTime})</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pre-workout protein or healthy snack alert 60–90 minutes before evening training.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifData.snackReminder}
                  onChange={(e) => setNotifData({ ...notifData, snackReminder: e.target.checked })}
                  className="w-5 h-5 accent-teal-500 cursor-pointer mt-1"
                />
              </div>

              {/* Dinner Reminder */}
              <div className="p-4 rounded-2xl bg-[#121722] border border-[#222c3d] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Sunset className="w-4 h-4" />
                    <span>Rest &amp; Repair Dinner ({formData.dinnerTime})</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ensures dinner is finished 3 hours prior to sleep for deep sleep &amp; hormone optimization.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifData.dinnerReminder}
                  onChange={(e) => setNotifData({ ...notifData, dinnerReminder: e.target.checked })}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer mt-1"
                />
              </div>

              {/* Hydration Water Alert */}
              <div className="p-4 rounded-2xl bg-[#121722] border border-[#222c3d] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <Droplets className="w-4 h-4" />
                    <span>Hydration Water Reminders (Every {formData.waterReminderIntervalHours}h)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Regular interval alerts to reach your {formData.dailyWaterTargetLiters}L daily water goal.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifData.waterReminder}
                  onChange={(e) => setNotifData({ ...notifData, waterReminder: e.target.checked })}
                  className="w-5 h-5 accent-blue-500 cursor-pointer mt-1"
                />
              </div>

              {/* Streak Alert Night Reminder */}
              <div className="p-4 rounded-2xl bg-[#121722] border border-[#222c3d] flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <Flame className="w-4 h-4" />
                    <span>Streak Guardian Night Alert (09:30 PM)</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sends emergency notification if no meal was logged today so you don't lose your streak!
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifData.streakAlertReminder}
                  onChange={(e) => setNotifData({ ...notifData, streakAlertReminder: e.target.checked })}
                  className="w-5 h-5 accent-rose-500 cursor-pointer mt-1"
                />
              </div>
            </div>
          </div>

          {/* Custom Reminders Header & List */}
          <div className="space-y-3 pt-4 border-t border-[#1f2838]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Custom User Reminders ({notifData.customReminders?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#161d2a] hover:bg-[#1f293a] border border-[#28364c] text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add Custom Reminder</span>
              </button>
            </div>

            {notifData.customReminders && notifData.customReminders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notifData.customReminders.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3.5 rounded-2xl bg-[#121722] border border-[#222c3d] flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{rem.title}</span>
                        <span className="text-[11px] font-black text-amber-400 px-2 py-0.5 rounded-md bg-amber-500/10">
                          {rem.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-xs">{rem.message}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        type="checkbox"
                        checked={rem.enabled}
                        onChange={() => handleToggleCustomReminder(rem.id)}
                        className="w-4 h-4 accent-amber-500 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomReminder(rem.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No custom reminders created yet. Click "Add Custom Reminder" to create personalized supplement, workout, or meal notifications.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 4: LIVE EMAIL & MOBILE SMS/WHATSAPP DISPATCH CENTER               */}
      {/* ========================================================================= */}
      {activeTab === 'dispatch' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-[#19202c] bg-[#0c1017] space-y-6 text-white">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f2838]">
            <div className="flex items-center gap-2.5">
              <Send className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-black tracking-tight">Real-Time Email &amp; Mobile Dispatch Center</h2>
            </div>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Live Delivery Gateways
            </span>
          </div>

          {/* ========================================================================= */}
          {/* AUTOMATED WELCOME EMAIL GATEWAY (From: roshanlokhande43@gmail.com)          */}
          {/* ========================================================================= */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0e1625] via-[#111827] to-[#0c121e] border-2 border-amber-500/30 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1f293d]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-white">Automated Welcome Email Gateway</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-extrabold uppercase">
                      Active on Login
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Sender: <strong className="text-amber-400 font-bold">roshanlokhande43@gmail.com</strong> (Roshan Lokhande)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">
                  Target: <strong className="text-cyan-300 font-semibold">{formData.email || currentUser?.email || 'member@calai.app'}</strong>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#090d14] border border-[#1b2434] space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Whenever any user logs in or registers on CalAI, an automated welcome email is dispatched to their email address greeting them by name (<strong className="text-white">{formData.name || currentUser?.displayName || 'User'}</strong>) from <strong className="text-amber-400">roshanlokhande43@gmail.com</strong>.
              </p>
              
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Real Gmail Inbox Delivery Information</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  • <strong>Direct Send (1-Click):</strong> Click <em>"Direct Send via Gmail Web"</em> below to send directly from your personal Gmail window right now.<br/>
                  • <strong>Automated Server Delivery:</strong> To let the server deliver into real inboxes automatically 24/7 without manual confirmation, provide a 16-character Google App Password (<code>GMAIL_APP_PASSWORD</code>) in your app settings.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Triggered on Every Login
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Sender: roshanlokhande43@gmail.com
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> HTML + Plaintext Template
                </span>
              </div>
            </div>

            {/* Status Feedback */}
            {welcomeSendResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 animate-fadeIn ${
                  welcomeSendResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {welcomeSendResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{welcomeSendResult.message}</span>
                </div>
                {welcomeSendResult.previewUrl && (
                  <div className="pt-1">
                    <a
                      href={welcomeSendResult.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 underline font-bold text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Click to View Sent Email Preview (Sandbox Render)</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                id="btn-test-welcome-email"
                onClick={handleSendWelcomeEmail}
                disabled={isSendingWelcome}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {isSendingWelcome ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Sending Welcome Email from roshanlokhande43@gmail.com...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send / Resend Welcome Email Now</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  const to = formData.email || currentUser?.email || 'member@calai.app';
                  const name = formData.name || currentUser?.displayName || 'Fitness Champion';
                  const subject = encodeURIComponent(`Welcome to CalAI, ${name}! 🥗🔥`);
                  const body = encodeURIComponent(
                    `Hello ${name} 👋,\n\nWelcome to CalAI!\nAapka account (${to}) successfully activate ho chuka hai.\n\nKey Highlights:\n- 99% AI Food & Macro Scanner\n- Personalized TDEE Targets\n- Circadian Meal Windows\n- Dynamic Workout Burn Suggester\n\nWarm regards,\nRoshan Lokhande\nFounder, CalAI (roshanlokhande43@gmail.com)`
                  );
                  window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${subject}&body=${body}`, '_blank');
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 text-cyan-200 font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Direct Send via Gmail Web (1-Click)</span>
              </button>
            </div>

            {/* Recent Welcome Logs */}
            {welcomeEmailLogs && welcomeEmailLogs.length > 0 && (
              <div className="pt-2 border-t border-[#1e2738] space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Recent Dispatched Welcome Emails ({welcomeEmailLogs.length})
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {welcomeEmailLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-[#0d121b] border border-[#1b2332] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="font-bold text-white">{log.toEmail}</span>
                        <span className="text-slate-400">({log.userName})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-amber-400/90 font-mono">from: {log.fromEmail}</span>
                        <span className="text-[10px] text-slate-500">{log.dateStr}</span>
                        {log.previewUrl && (
                          <a
                            href={log.previewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-cyan-400 underline font-bold"
                          >
                            Preview
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cards for Email & Phone Dispatch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. EMAIL TRANSMITTER */}
            <div className="p-5 rounded-3xl bg-[#111622] border border-[#1e2738] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Email Alert Dispatch Gateway</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                        NodeMailer Active
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Target Email: <strong className="text-cyan-300 font-bold">{formData.email || 'pj344504@gmail.com'}</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSmtpSettings(!showSmtpSettings)}
                  className="px-2.5 py-1 rounded-lg bg-[#18212f] hover:bg-[#202c3e] border border-[#2b3a4f] text-[11px] font-bold text-slate-300 transition flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="w-3 h-3 text-amber-400" />
                  <span>SMTP Settings</span>
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#161d2a] p-3 rounded-xl border border-[#273449]">
                Sends your full customized calorie budget, macronutrient targets, and circadian meal windows directly to <strong className="text-white">{formData.email || 'pj344504@gmail.com'}</strong>.
              </p>

              {/* Email Delivery Result Status */}
              {emailDeliveryResult && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 animate-fadeIn ${
                    emailDeliveryResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {emailDeliveryResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{emailDeliveryResult.message}</span>
                  </div>
                  {emailDeliveryResult.previewUrl && (
                    <div className="pt-1">
                      <a
                        href={emailDeliveryResult.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 underline font-semibold text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Dispatched Email Preview (Ethereal Sandbox)</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* 1. Direct Server Email Dispatch */}
                <button
                  type="button"
                  id="btn-send-server-email"
                  onClick={handleSendRealServerEmail}
                  disabled={isSendingEmail}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isSendingEmail ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Dispatching Email...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch Real Server Email</span>
                    </>
                  )}
                </button>

                {/* 2. Open Direct in Gmail Web */}
                <button
                  type="button"
                  id="btn-open-gmail-web"
                  onClick={handleOpenGmailWeb}
                  className="px-3.5 py-2 rounded-xl bg-[#1e293b] hover:bg-[#2b3a4f] border border-cyan-500/40 text-cyan-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Open directly in Gmail web with pre-composed alert"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open in Gmail Web</span>
                </button>

                {/* 3. Open in Outlook Web */}
                <button
                  type="button"
                  onClick={handleOpenOutlookWeb}
                  className="px-3 py-2 rounded-xl bg-[#18212f] hover:bg-[#202c3e] border border-[#2b3a4f] text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  title="Open directly in Outlook web"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                  <span>Outlook Web</span>
                </button>

                {/* 4. Native App / Mailto */}
                <button
                  type="button"
                  onClick={handleSendEmailAlert}
                  className="px-3 py-2 rounded-xl bg-[#18212f] hover:bg-[#202c3e] border border-[#2b3a4f] text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  title="Open default email application on this device"
                >
                  <Send className="w-3 h-3 text-slate-400" />
                  <span>Native Mail</span>
                </button>

                {/* 5. Copy Text */}
                <button
                  type="button"
                  onClick={handleCopyEmailReport}
                  className="px-3 py-2 rounded-xl bg-[#18212f] hover:bg-[#202c3e] border border-[#2b3a4f] text-slate-300 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>{copiedEmail ? 'Copied!' : 'Copy Text'}</span>
                </button>
              </div>

              {/* Expandable Custom SMTP Configuration Card */}
              {showSmtpSettings && (
                <div className="p-4 rounded-2xl bg-[#0e131c] border border-cyan-500/30 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-[#1f293a]">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      <span className="font-extrabold text-xs text-white">Custom SMTP Server Configuration (Optional)</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Default: Direct Server Relay</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    If you want alerts sent directly via your own Gmail (with App Password), SendGrid, or custom mail server, enter the credentials below:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-1">SMTP Host</label>
                      <input
                        type="text"
                        placeholder="e.g. smtp.gmail.com or smtp.sendgrid.net"
                        value={smtpFormData.host}
                        onChange={(e) => setSmtpFormData({ ...smtpFormData, host: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#161e2c] border border-[#26354b] text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-1">SMTP Port</label>
                      <input
                        type="number"
                        placeholder="587 or 465"
                        value={smtpFormData.port}
                        onChange={(e) => setSmtpFormData({ ...smtpFormData, port: Number(e.target.value) || 587 })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#161e2c] border border-[#26354b] text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-1">SMTP User / Email</label>
                      <input
                        type="text"
                        placeholder="e.g. your_email@gmail.com"
                        value={smtpFormData.user}
                        onChange={(e) => setSmtpFormData({ ...smtpFormData, user: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#161e2c] border border-[#26354b] text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 font-bold mb-1">SMTP Password / App Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={smtpFormData.pass}
                        onChange={(e) => setSmtpFormData({ ...smtpFormData, pass: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#161e2c] border border-[#26354b] text-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Verification Status */}
                  {smtpVerifyResult && (
                    <div
                      className={`p-2.5 rounded-lg text-xs flex items-center gap-1.5 ${
                        smtpVerifyResult.success
                          ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/50 border border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {smtpVerifyResult.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      )}
                      <span>{smtpVerifyResult.message}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleVerifySmtpCredentials}
                      disabled={smtpVerifying}
                      className="px-3 py-1.5 rounded-lg bg-[#1c2534] hover:bg-[#253246] border border-[#31425c] text-xs font-bold text-slate-200 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {smtpVerifying ? (
                        <>
                          <span className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>Test SMTP Connection</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveSmtpSettings}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3 h-3" />
                      <span>Save SMTP Settings</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 2. MOBILE NUMBER & WHATSAPP TRANSMITTER */}
            <div className="p-5 rounded-3xl bg-[#111622] border border-[#1e2738] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Mobile Phone Alert Gateway</h3>
                  <p className="text-xs text-slate-400">
                    Recipient: <strong className="text-emerald-300">{formData.phone || '+91 98765 43210'}</strong>
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-[#161d2a] p-3 rounded-xl border border-[#273449]">
                Sends real-time notification alerts directly to your mobile phone number via WhatsApp Gateway, SMS application, or Web Push vibration.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendWhatsAppAlert}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendSmsAlert}
                  className="px-3.5 py-2 rounded-xl bg-[#18212f] hover:bg-[#202c3e] border border-[#2b3a4f] text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Send Native SMS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Multichannel Automated Alert Preview Box */}
          <div className="p-4 rounded-2xl bg-[#0e131b] border border-[#1c2432] space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Automated Circadian Meal Windows Schedule</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#141a25] border border-[#222c3c]">
                <span className="text-slate-400 block text-[10px]">Morning Fuel</span>
                <span className="font-black text-amber-300">{formData.breakfastTime}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141a25] border border-[#222c3c]">
                <span className="text-slate-400 block text-[10px]">Midday Lunch</span>
                <span className="font-black text-cyan-300">{formData.lunchTime}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141a25] border border-[#222c3c]">
                <span className="text-slate-400 block text-[10px]">Afternoon Snack</span>
                <span className="font-black text-teal-300">{formData.snackTime}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141a25] border border-[#222c3c]">
                <span className="text-slate-400 block text-[10px]">Rest &amp; Repair Dinner</span>
                <span className="font-black text-indigo-300">{formData.dinnerTime}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB 5: NOTIFICATION LOGS & HISTORY                                     */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-[#19202c] bg-[#0c1017] space-y-5 text-white">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f2838]">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-black tracking-tight">Recent Notification &amp; Dispatch Logs</h2>
            </div>
            {notificationLogs.length > 0 && (
              <button
                type="button"
                onClick={onClearNotificationLogs}
                className="text-xs text-slate-400 hover:text-rose-400 transition"
              >
                Clear History
              </button>
            )}
          </div>

          {notificationLogs.length > 0 ? (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {notificationLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-[#121722] border border-[#222c3d] flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-100">{log.title}</span>
                      {log.channel && (
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                            log.channel === 'email'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : log.channel === 'whatsapp'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : log.channel === 'sms'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {log.channel}
                        </span>
                      )}
                      {log.recipient && (
                        <span className="text-[10px] text-slate-400 italic">({log.recipient})</span>
                      )}
                    </div>
                    <p className="text-slate-400 leading-relaxed">{log.body}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-medium">{log.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <BellOff className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500">No alerts logged yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: ADD CUSTOM REMINDER                                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-[#242e40] bg-[#0f141d] p-6 shadow-2xl space-y-4 text-white"
            >
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Create Custom Reminder</span>
              </h3>

              <form onSubmit={handleAddCustomReminder} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Reminder Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 💊 Take Creatine &amp; Multivitamin"
                    value={newCustomReminder.title}
                    onChange={(e) => setNewCustomReminder({ ...newCustomReminder, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141b26] border border-[#242f42] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Alert Message</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. 5g creatine with 300ml water for muscular hydration."
                    value={newCustomReminder.message}
                    onChange={(e) => setNewCustomReminder({ ...newCustomReminder, message: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#141b26] border border-[#242f42] text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Alert Time</label>
                    <input
                      type="time"
                      required
                      value={newCustomReminder.time}
                      onChange={(e) => setNewCustomReminder({ ...newCustomReminder, time: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#141b26] border border-[#242f42] text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-300 block mb-1">Category</label>
                    <select
                      value={newCustomReminder.type}
                      onChange={(e) =>
                        setNewCustomReminder({
                          ...newCustomReminder,
                          type: e.target.value as CustomReminder['type'],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-[#141b26] border border-[#242f42] text-white"
                    >
                      <option value="meal">Meal / Nutrition</option>
                      <option value="water">Hydration</option>
                      <option value="workout">Pre/Post Workout</option>
                      <option value="streak">Streak Reminder</option>
                      <option value="custom">General Custom</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1f2838]">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="px-4 py-2 rounded-xl hover:bg-white/10 text-slate-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black hover:bg-amber-600 transition shadow-md"
                  >
                    Save Reminder
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
