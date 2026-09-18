/**
 * Domain date/time conventions
 * ============================
 *
 * All persisted timestamps use ISO 8601 strings in UTC.
 *
 * - Calendar dates (reportDate): `YYYY-MM-DD` via toISODate()
 * - Instants (createdAt, updatedAt, capturedAt, signedAt): full UTC via toUTCString()
 *
 * Display formatting lives in src/utils/dates.ts and must not be used for storage.
 */

export function toISODate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function toUTCString(date: Date = new Date()): string {
  return date.toISOString();
}

export function isISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

export function isUTCInstant(value: string): boolean {
  const time = Date.parse(value);
  return !Number.isNaN(time) && value.includes('T');
}
