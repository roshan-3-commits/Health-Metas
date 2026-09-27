import {
  CalculatorInputs,
  LoggedMeal,
  NotificationLog,
  NotificationSettings,
  UserProfile,
} from '../types';

const PROFILE_KEY = 'healthmeta_user_profile';
const NOTIFICATIONS_SETTINGS_KEY = 'healthmeta_notification_settings';
const NOTIFICATIONS_LOGS_KEY = 'healthmeta_notification_logs';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Fitness Member',
  email: '',
  phone: '',
  age: 26,
  gender: 'male',
  heightCm: 175,
  weightKg: 70,
  targetWeightKg: 68,
  activityLevel: 'moderate',
  goal: 'maintain',
  dietaryPreference: 'all',
  dailyWaterTargetLiters: 2.5,
  dailyStepGoal: 8000,
  avatar: 'FM',
  photoUrl: '',
  breakfastTime: '08:30',
  lunchTime: '13:00',
  snackTime: '17:00',
  dinnerTime: '20:30',
  wakeTime: '07:00',
  sleepTime: '23:00',
  waterReminderIntervalHours: 2,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  emailAlertsEnabled: true,
  smsAlertsEnabled: false,
  whatsappAlertsEnabled: false,
  devicePushEnabled: false,
  breakfastReminder: true,
  lunchReminder: true,
  snackReminder: true,
  dinnerReminder: true,
  waterReminder: true,
  streakAlertReminder: true,
  nightReviewReminder: true,
  dailyEmailSummary: false,
  customReminders: [],
  permissionGranted: false,
};

export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to save profile:', err);
  }
}

export function loadNotificationSettings(): NotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_SETTINGS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save notification settings:', err);
  }
}

export function loadNotificationLogs(): NotificationLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveNotificationLogs(logs: NotificationLog[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch (err) {
    console.warn('Failed to save notification logs:', err);
  }
}

export function syncProfileToCalculatorInputs(profile: UserProfile, inputs: CalculatorInputs): CalculatorInputs {
  return {
    ...inputs,
    age: profile.age || inputs.age,
    gender: profile.gender || inputs.gender,
    heightCm: profile.heightCm || inputs.heightCm,
    weightKg: profile.weightKg || inputs.weightKg,
    activityLevel: profile.activityLevel || inputs.activityLevel,
    goal: profile.goal || inputs.goal,
    targetWeightKg: profile.targetWeightKg || inputs.targetWeightKg,
  };
}

export function syncCalculatorInputsToProfile(inputs: CalculatorInputs, profile: UserProfile): UserProfile {
  return {
    ...profile,
    age: Number(inputs.age) || profile.age,
    gender: inputs.gender || profile.gender,
    heightCm: Number(inputs.heightCm) || profile.heightCm,
    weightKg: Number(inputs.weightKg) || profile.weightKg,
    activityLevel: inputs.activityLevel || profile.activityLevel,
    goal: inputs.goal || profile.goal,
    targetWeightKg: Number(inputs.targetWeightKg) || profile.targetWeightKg,
    updatedAt: Date.now(),
  };
}

export async function requestBrowserNotificationPermission(): Promise<{ granted: boolean; status: string }> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { granted: false, status: 'unsupported' };
  }
  try {
    const permission = await Notification.requestPermission();
    return { granted: permission === 'granted', status: permission };
  } catch {
    return { granted: false, status: 'denied' };
  }
}

export function triggerDeviceNotification(
  title: string,
  options?: string | { body?: string; sound?: boolean; vibrate?: boolean }
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  const bodyText = typeof options === 'string' ? options : options?.body || '';
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body: bodyText,
        icon: '/favicon.ico',
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5

    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.36);
  } catch {
    // AudioContext blocked or not supported
  }
}

export function generateEmailReport(
  profile: UserProfile,
  subjectSuffix = 'Circadian Meal Schedule & Nutrition Targets',
  customNoteOrDetails?: string
): { subject: string; body: string } {
  const subject = `[Health Meta] ${subjectSuffix} - ${profile.name || 'Champion'}`;
  const note = customNoteOrDetails || `Personalized daily nutrition & meal reminder for ${new Date().toLocaleDateString()}. Stay consistent and fuel your health!`;

  const body = `
Hello ${profile.name || 'Champion'},

${note}

YOUR BIOMETRIC & METABOLIC TARGETS:
- Goal: ${profile.goal?.toUpperCase() || 'MAINTAIN'}
- Current Weight: ${profile.weightKg} kg
- Target Weight: ${profile.targetWeightKg} kg
- Daily Hydration Target: ${profile.dailyWaterTargetLiters} Liters
- Daily Step Target: ${profile.dailyStepGoal} steps

CIRCADIAN MEAL WINDOWS:
- Breakfast Window: ${profile.breakfastTime}
- Lunch Window: ${profile.lunchTime}
- Afternoon Refresh: ${profile.snackTime}
- Dinner Window: ${profile.dinnerTime}

Log your meals daily on Health Meta to maintain your metabolic momentum and streak.

Best regards,
Health Meta Intelligence System
`.trim();

  return { subject, body };
}

export function openNativeEmailClient(to: string, subject: string, body: string): void {
  const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
}

export function openGmailWebDirect(to: string, subject: string, body: string): void {
  const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    to
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, '_blank');
}

export function openOutlookWebDirect(to: string, subject: string, body: string): void {
  const url = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
    to
  )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, '_blank');
}

export function openWhatsAppGateway(phone: string, text: string): void {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export function openSmsGateway(phone: string, text: string): void {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const url = `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

export async function sendRealEmailAlertApi(
  profileOrParams: any,
  subject?: string,
  body?: string,
  alertType?: string,
  smtpConfig?: any
): Promise<any> {
  const payload =
    subject && body
      ? {
          to: profileOrParams.email,
          userName: profileOrParams.name,
          subject,
          text: body,
          alertType: alertType || 'manual_dispatch',
          smtpConfig: smtpConfig || profileOrParams.smtpConfig,
        }
      : profileOrParams;

  const res = await fetch('/api/send-email-alert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}
