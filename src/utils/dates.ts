import { toISODate, toUTCString } from '../domain/dates';

/** @see src/domain/dates.ts for storage format conventions */
export { toISODate, toUTCString };

/** Alias kept for callers expecting toISOString naming. */
export const toISOString = toUTCString;

export function formatDisplayDate(isoDate: string): string {
  const date = new Date(
    isoDate.includes('T') ? isoDate : `${isoDate}T00:00:00`,
  );
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return formatDisplayDate(isoString);
}
