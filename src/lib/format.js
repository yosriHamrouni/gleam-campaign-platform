// src/lib/format.js
import { Globe, Instagram, Megaphone, Share2, Twitter, Youtube } from 'lucide-react';

export const ACTION_TYPES = [
  { value: 'follow_instagram', label: 'Follow on Instagram', icon: Instagram, color: 'text-pink-500', placeholder: '@yourbrand' },
  { value: 'follow_twitter', label: 'Follow on X (Twitter)', icon: Twitter, color: 'text-sky-500', placeholder: '@yourbrand' },
  { value: 'subscribe_youtube', label: 'Subscribe on YouTube', icon: Youtube, color: 'text-red-500', placeholder: 'https://youtube.com/@yourchannel' },
  { value: 'visit_website', label: 'Visit website', icon: Globe, color: 'text-emerald-600', placeholder: 'https://example.com' },
  { value: 'share_post', label: 'Share post', icon: Share2, color: 'text-indigo-500', placeholder: 'https://example.com/post' },
  { value: 'custom', label: 'Custom action', icon: Megaphone, color: 'text-amber-500', placeholder: 'Describe what to do' },
];

export const actionMeta = (type) => ACTION_TYPES.find((a) => a.value === type) || ACTION_TYPES[ACTION_TYPES.length - 1];

export const COMPETITION_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'quick-draw', label: 'Quick draw' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'challenge', label: 'Challenge' },
];

const isUrl = (s) => /^https?:\/\//i.test(s || '');

// Where the "Do it" button sends the participant; null for actions with no link.
export function actionHref({ type, value }) {
  if (isUrl(value)) return value;
  const handle = String(value || '').replace(/^@/, '').trim();
  if (!handle || /\s/.test(handle)) return null;
  if (type === 'follow_instagram') return `https://instagram.com/${handle}`;
  if (type === 'follow_twitter') return `https://x.com/${handle}`;
  if (type === 'subscribe_youtube') return `https://youtube.com/@${handle}`;
  return null;
}

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—';

export const daysUntil = (d) => Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86_400_000));

// "Ends in 3 days" / "Starts in 5 days" / "Ended 12 Mar 2026"
export function timing(c) {
  if (c.status === 'scheduled') return `Starts in ${daysUntil(c.startDate)} day${daysUntil(c.startDate) === 1 ? '' : 's'}`;
  if (c.status === 'active') {
    const n = daysUntil(c.endDate);
    return n === 0 ? 'Ends today' : `Ends in ${n} day${n === 1 ? '' : 's'}`;
  }
  if (c.status === 'drawn') return `Drawn ${formatDate(c.drawnAt)}`;
  return `Ended ${formatDate(c.endDate)}`;
}

export const percent = (num, den) => (den > 0 ? `${Math.round((num / den) * 100)}%` : '—');

// Value for <input type="datetime-local"> in the user's time zone.
export const toLocalInput = (date) => {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
