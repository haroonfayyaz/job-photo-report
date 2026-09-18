/**
 * Generates a locally unique ID suitable for offline-first storage.
 * Format: `{timestamp-base36}-{random-base36}` — no server required.
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${timestamp}-${random}`;
}

export function isValidId(value: string): boolean {
  return typeof value === 'string' && value.trim().length >= 8 && !/\s/.test(value);
}
