import { useCallback, useEffect, useState } from 'react';
import { humanCountdown } from '../utils/date.js';

const REMINDER_KEY = 'myfridge.reminders.v1';
const SUPPORTED = typeof window !== 'undefined' && 'Notification' in window;

/**
 * useNotifications - wraps the Notifications API.
 *
 * The browser only allows notifications in two situations:
 *   1. the user has granted permission through a click handler, and
 *   2. the page is still open (unless a service worker push is used).
 * So the app asks for permission on an explicit button press and sends a
 * summary notification for items that are expiring, instead of pretending to
 * run a background job. The last check date is persisted so the app can tell
 * the user how long ago it warned them.
 */
export function useNotifications(items) {
  const [permission, setPermission] = useState(
    SUPPORTED ? Notification.permission : 'unsupported'
  );
  const [lastCheck, setLastCheck] = useState(() => readReminderState().lastCheck ?? null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!SUPPORTED) return undefined;
    // Keep the local state in sync if permission is changed in site settings.
    const sync = () => setPermission(Notification.permission);
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  const requestPermission = useCallback(async () => {
    if (!SUPPORTED) {
      setFeedback('Notifications are not supported in this browser.');
      return 'unsupported';
    }
    if (Notification.permission === 'granted') {
      setFeedback('Reminders are already enabled.');
      return 'granted';
    }
    if (Notification.permission === 'denied') {
      setFeedback('Notifications are blocked. Enable them in the site settings, then reload.');
      return 'denied';
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    setFeedback(
      result === 'granted'
        ? 'Reminders enabled. MyFridge will warn you about expiring food.'
        : 'Reminders were not enabled.'
    );
    return result;
  }, []);

  /** Builds and shows the expiry summary notification. */
  const checkExpiring = useCallback(() => {
    const expiring = items.filter((item) => {
      const days = daysLeft(item.expiryDate);
      return days !== null && days <= 3;
    });

    if (expiring.length === 0) {
      setFeedback('Nothing is expiring in the next three days. Enjoy the fridge!');
      persistReminderState({ lastCheck: new Date().toISOString() });
      setLastCheck(new Date().toISOString());
      return { sent: false, count: 0 };
    }

    const body = expiring
      .slice(0, 5)
      .map((item) => `${item.name} - ${humanCountdown(item.expiryDate)}`)
      .join('\n');

    if (SUPPORTED && Notification.permission === 'granted') {
      new Notification('MyFridge: expiring soon', {
        body,
        icon: '/icons/pwa-192.png',
        badge: '/icons/pwa-192.png',
        tag: 'myfridge-expiry-check'
      });
    }

    const now = new Date().toISOString();
    persistReminderState({ lastCheck: now });
    setLastCheck(now);
    setFeedback(
      SUPPORTED && Notification.permission === 'granted'
        ? `Reminder sent for ${expiring.length} item(s).`
        : `${expiring.length} item(s) need attention. Enable reminders to be notified.`
    );
    return { sent: true, count: expiring.length };
  }, [items]);

  return { permission, lastCheck, feedback, requestPermission, checkExpiring };
}

function daysLeft(isoDate) {
  const [year, month, day] = (isoDate ?? '').split('-').map(Number);
  if (!year) return null;
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(year, month - 1, day);
  return Math.round((target.getTime() - start.getTime()) / 86400000);
}

function readReminderState() {
  try {
    return JSON.parse(window.localStorage.getItem(REMINDER_KEY)) ?? {};
  } catch {
    return {};
  }
}

function persistReminderState(next) {
  try {
    window.localStorage.setItem(REMINDER_KEY, JSON.stringify(next));
  } catch {
    /* reminder metadata is optional - ignore quota failures here */
  }
}
