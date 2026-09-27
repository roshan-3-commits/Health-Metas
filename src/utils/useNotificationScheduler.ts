import { useEffect, useRef } from 'react';
import { NotificationLog, NotificationSettings, UserProfile } from '../types';
import {
  playNotificationSound,
  triggerDeviceNotification,
} from './profileAndNotifications';

interface UseNotificationSchedulerProps {
  profile: UserProfile;
  settings: NotificationSettings;
  onNewNotificationLog: (log: NotificationLog) => void;
  onToast: (title: string, message: string) => void;
  hasMealsLoggedToday: boolean;
}

export function useNotificationScheduler({
  profile,
  settings,
  onNewNotificationLog,
  onToast,
  hasMealsLoggedToday,
}: UseNotificationSchedulerProps) {
  const lastTriggeredMinuteRef = useRef<string>('');

  useEffect(() => {
    if (!settings.enabled) return;

    const checkSchedule = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeKey = `${currentHours}:${currentMinutes}`;

      if (lastTriggeredMinuteRef.current === timeKey) {
        return; // Avoid double firing within the same minute
      }

      const fireAlert = (title: string, body: string, type: NotificationLog['type']) => {
        lastTriggeredMinuteRef.current = timeKey;

        if (settings.soundEnabled) {
          playNotificationSound();
        }

        if (settings.devicePushEnabled) {
          triggerDeviceNotification(title, body);
        }

        onToast(title, body);

        const newLog: NotificationLog = {
          id: `log_${Date.now()}`,
          title,
          body,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type,
          channel: 'push',
          status: 'delivered',
          read: false,
          timestamp: Date.now(),
        };
        onNewNotificationLog(newLog);
      };

      // Breakfast Reminder
      if (settings.breakfastReminder && profile.breakfastTime === timeKey) {
        fireAlert(
          '🍳 Breakfast Window Open',
          `Good morning ${profile.name || 'Champion'}! Time to refuel with a nutritious breakfast.`,
          'meal'
        );
        return;
      }

      // Lunch Reminder
      if (settings.lunchReminder && profile.lunchTime === timeKey) {
        fireAlert(
          '🥗 Midday Lunch Target',
          `Time for lunch! Keep your macros balanced with lean protein and fiber.`,
          'meal'
        );
        return;
      }

      // Snack Reminder
      if (settings.snackReminder && profile.snackTime === timeKey) {
        fireAlert(
          '🍎 Afternoon Metabolic Refresh',
          `Grab a healthy snack or hydration boost to sustain your energy levels.`,
          'meal'
        );
        return;
      }

      // Dinner Reminder
      if (settings.dinnerReminder && profile.dinnerTime === timeKey) {
        fireAlert(
          '🍲 Evening Dinner Window',
          `Dinner time! Refuel and record your meal to protect your daily streak.`,
          'meal'
        );
        return;
      }

      // Streak Alert Reminder (Night reminder if no meals logged)
      if (
        settings.streakAlertReminder &&
        !hasMealsLoggedToday &&
        timeKey === '21:00'
      ) {
        fireAlert(
          '🔥 Streak In Danger!',
          `You haven't logged any meals today! Log a meal now to keep your streak alive.`,
          'streak'
        );
        return;
      }

      // Custom Reminders
      if (settings.customReminders && settings.customReminders.length > 0) {
        for (const rem of settings.customReminders) {
          if (rem.enabled && rem.time === timeKey) {
            fireAlert(rem.title, rem.message, rem.type as any);
            return;
          }
        }
      }
    };

    const intervalId = setInterval(checkSchedule, 15000);
    return () => clearInterval(intervalId);
  }, [profile, settings, onNewNotificationLog, onToast, hasMealsLoggedToday]);
}
