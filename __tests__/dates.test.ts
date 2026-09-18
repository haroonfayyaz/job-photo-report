import {
  formatDisplayDate,
  formatRelativeTime,
  toISODate,
} from '../src/utils/dates';

describe('dates', () => {
  it('formats ISO date', () => {
    expect(toISODate(new Date('2025-09-18T15:30:00.000Z'))).toBe('2025-09-18');
  });

  it('formats display date', () => {
    const formatted = formatDisplayDate('2025-09-18');
    expect(formatted).toContain('2025');
  });

  it('formats relative time for recent timestamps', () => {
    const recent = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(recent)).toBe('5m ago');
  });
});
