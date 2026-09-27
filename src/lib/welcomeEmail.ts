/**
 * Welcome Email Dispatch Service
 * Handles sending automated welcome messages to users on login / sign-up
 * from 'roshanlokhande43@gmail.com'
 */

import { getAccessToken } from './firebase';
import { sendWelcomeEmailViaGmailApi } from './gmail';
import { loadNotificationSettings } from '../utils/profileAndNotifications';

const SENDER_EMAIL = 'roshanlokhande43@gmail.com';
const WELCOME_HISTORY_KEY = 'calai_welcome_email_history';
const SENT_EMAILS_KEY = 'calai_welcome_sent_emails';

export interface WelcomeDispatchLog {
  id: string;
  toEmail: string;
  userName: string;
  fromEmail: string;
  timestamp: number;
  dateStr: string;
  status: 'sent' | 'failed';
  transport: string;
  previewUrl?: string | null;
  error?: string;
}

export interface DispatchWelcomeParams {
  toEmail: string;
  userName?: string;
  force?: boolean;
}

export interface DispatchWelcomeResponse {
  success: boolean;
  message: string;
  transport?: string;
  previewUrl?: string | null;
  fromEmail: string;
  toEmail: string;
}

/**
 * Checks if a welcome email has already been dispatched to this address
 */
export function hasWelcomeEmailBeenSent(email: string): boolean {
  if (!email || typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(SENT_EMAILS_KEY);
    const sentList: string[] = raw ? JSON.parse(raw) : [];
    return sentList.includes(email.toLowerCase().trim());
  } catch {
    return false;
  }
}

/**
 * Retrieves the local history of dispatched welcome emails
 */
export function getWelcomeEmailLogs(): WelcomeDispatchLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WELCOME_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWelcomeEmailLog(log: WelcomeDispatchLog) {
  if (typeof window === 'undefined') return;
  try {
    const logs = getWelcomeEmailLogs();
    logs.unshift(log);
    localStorage.setItem(WELCOME_HISTORY_KEY, JSON.stringify(logs.slice(0, 30)));

    // Record email in sent list
    const rawSent = localStorage.getItem(SENT_EMAILS_KEY);
    const sentList: string[] = rawSent ? JSON.parse(rawSent) : [];
    const normalized = log.toEmail.toLowerCase().trim();
    if (!sentList.includes(normalized)) {
      sentList.push(normalized);
      localStorage.setItem(SENT_EMAILS_KEY, JSON.stringify(sentList));
    }
  } catch (err) {
    console.warn('Failed to save welcome email log:', err);
  }
}

/**
 * Dispatches a welcome email from roshanlokhande43@gmail.com
 * to the specified user email address upon login/registration.
 */
export async function dispatchWelcomeEmail({
  toEmail,
  userName = 'Fitness Champion',
  force = false,
}: DispatchWelcomeParams): Promise<DispatchWelcomeResponse> {
  const cleanEmail = toEmail?.trim();
  if (!cleanEmail) {
    return {
      success: false,
      message: 'No recipient email specified',
      fromEmail: SENDER_EMAIL,
      toEmail: '',
    };
  }

  // Prevent spamming the same user on every re-render unless forced
  if (!force && hasWelcomeEmailBeenSent(cleanEmail)) {
    return {
      success: true,
      message: `Welcome email already sent to ${cleanEmail} previously.`,
      fromEmail: SENDER_EMAIL,
      toEmail: cleanEmail,
      transport: 'already_delivered',
    };
  }

  const cleanName = userName || cleanEmail.split('@')[0] || 'Fitness Champion';

  // 1. Try Google Gmail REST API if an active Google Workspace OAuth token is in memory
  const googleToken = getAccessToken();
  if (googleToken) {
    try {
      const gmailResult = await sendWelcomeEmailViaGmailApi({
        accessToken: googleToken,
        toEmail: cleanEmail,
        userName: cleanName,
        senderEmail: SENDER_EMAIL,
      });

      if (gmailResult.success) {
        const log: WelcomeDispatchLog = {
          id: 'welc_g_' + Date.now(),
          toEmail: cleanEmail,
          userName: cleanName,
          fromEmail: SENDER_EMAIL,
          timestamp: Date.now(),
          dateStr: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          status: 'sent',
          transport: 'google_gmail_api',
        };
        saveWelcomeEmailLog(log);

        return {
          success: true,
          message: `Welcome email dispatched via Google Workspace Gmail API from ${SENDER_EMAIL} to ${cleanEmail}!`,
          transport: 'google_gmail_api',
          fromEmail: SENDER_EMAIL,
          toEmail: cleanEmail,
        };
      }
    } catch (e) {
      console.warn('Google Gmail API attempt warning, falling back to server dispatch:', e);
    }
  }

  // 2. Dispatch via Server-side Endpoint (/api/send-welcome-email)
  try {
    const notifSettings = loadNotificationSettings();
    const smtp = notifSettings.smtpConfig;
    const smtpConfig = (smtp?.pass || smtp?.host) ? {
      host: smtp.host || 'smtp.gmail.com',
      port: smtp.port || 587,
      user: smtp.user || SENDER_EMAIL,
      pass: smtp.pass,
    } : undefined;

    const res = await fetch('/api/send-welcome-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        toEmail: cleanEmail,
        userName: cleanName,
        fromEmail: SENDER_EMAIL,
        smtpConfig,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Server rejected welcome email dispatch');
    }

    const log: WelcomeDispatchLog = {
      id: data.log?.id || 'welc_srv_' + Date.now(),
      toEmail: cleanEmail,
      userName: cleanName,
      fromEmail: SENDER_EMAIL,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      status: 'sent',
      transport: data.log?.transportType || 'server_mail',
      previewUrl: data.log?.previewUrl || null,
    };
    saveWelcomeEmailLog(log);

    return {
      success: true,
      message: `Welcome email sent successfully to ${cleanEmail} from ${SENDER_EMAIL}!`,
      transport: data.log?.transportType || 'server_mail',
      previewUrl: data.log?.previewUrl || null,
      fromEmail: SENDER_EMAIL,
      toEmail: cleanEmail,
    };
  } catch (err: any) {
    console.error('Welcome email dispatch error:', err);

    const failLog: WelcomeDispatchLog = {
      id: 'welc_err_' + Date.now(),
      toEmail: cleanEmail,
      userName: cleanName,
      fromEmail: SENDER_EMAIL,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      status: 'failed',
      transport: 'local_queue',
      error: err?.message,
    };
    saveWelcomeEmailLog(failLog);

    return {
      success: false,
      message: `Could not send email: ${err?.message || 'Network error'}`,
      fromEmail: SENDER_EMAIL,
      toEmail: cleanEmail,
    };
  }
}
