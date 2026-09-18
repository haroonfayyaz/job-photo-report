import {
  buildReportNumber,
  formatReportNumberPrefix,
  parseReportNumberSequence,
} from '../src/services/reportNumberService';

describe('reportNumberService', () => {
  it('formats report number prefix from date', () => {
    const date = new Date('2025-09-18T10:00:00.000Z');
    expect(formatReportNumberPrefix(date)).toBe('RPT-20250918');
  });

  it('builds padded report numbers', () => {
    expect(buildReportNumber('RPT-20250918', 1)).toBe('RPT-20250918-001');
    expect(buildReportNumber('RPT-20250918', 42)).toBe('RPT-20250918-042');
    expect(buildReportNumber('RPT-20250918', 1000)).toBe('RPT-20250918-1000');
  });

  it('parses sequence from report number', () => {
    expect(parseReportNumberSequence('RPT-20250918-001')).toBe(1);
    expect(parseReportNumberSequence('RPT-20250918-042')).toBe(42);
    expect(parseReportNumberSequence('INVALID')).toBeNull();
  });
});
