import {
  isISODate,
  isUTCInstant,
  toISODate,
  toUTCString,
} from '../../src/domain/dates';

describe('domain dates', () => {
  it('stores calendar dates as YYYY-MM-DD', () => {
    expect(toISODate(new Date('2025-09-18T15:30:00.000Z'))).toBe('2025-09-18');
  });

  it('stores instants as UTC ISO strings', () => {
    const instant = toUTCString(new Date('2025-09-18T15:30:00.000Z'));
    expect(instant).toBe('2025-09-18T15:30:00.000Z');
    expect(isUTCInstant(instant)).toBe(true);
  });

  it('validates ISO date strings', () => {
    expect(isISODate('2025-09-18')).toBe(true);
    expect(isISODate('2025-13-01')).toBe(false);
    expect(isISODate('18-09-2025')).toBe(false);
  });
});
