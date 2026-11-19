// Date helpers. Everything is stored as an ISO "YYYY-MM-DD" string so that
// the value survives a JSON round-trip through localStorage unchanged.

import { SOON_THRESHOLD_DAYS, STATUS } from '../constants.js';

/** Today at midnight, in the user's local time zone. */
export function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Parse "YYYY-MM-DD" into a local Date at midnight (no UTC off-by-one). */
export function parseISODate(isoDate) {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Number of whole days from today until the given date. Negative = already expired. */
export function daysUntil(isoDate) {
  const target = parseISODate(isoDate);
  if (!target) return null;
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((target.getTime() - startOfToday().getTime()) / MS_PER_DAY);
}

export function expiryStatus(isoDate) {
  const remaining = daysUntil(isoDate);
  if (remaining === null) return STATUS.fresh;
  if (remaining < 0) return STATUS.expired;
  if (remaining <= SOON_THRESHOLD_DAYS) return STATUS.soon;
  return STATUS.fresh;
}

/** "3 days left", "Expired 2 days ago", "Today". */
export function humanCountdown(isoDate) {
  const remaining = daysUntil(isoDate);
  if (remaining === null) return 'No date set';
  if (remaining === 0) return 'Expires today';
  if (remaining === 1) return '1 day left';
  if (remaining > 1) return `${remaining} days left`;
  const overdue = Math.abs(remaining);
  return overdue === 1 ? 'Expired yesterday' : `Expired ${overdue} days ago`;
}

export function formatShortDate(isoDate) {
  const date = parseISODate(isoDate);
  if (!date) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** ISO date string for today, used as the default value in the add form. */
export function todayISO() {
  const today = startOfToday();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

/** Date shifted by n days, used to seed the demo data. */
export function isoDateFromOffset(offsetDays) {
  const date = startOfToday();
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}
