import {
  buildReportNumber,
  formatReportNumberPrefix,
  parseReportNumberSequence,
  validateReportNumber,
} from '../../src/domain/validation/reportNumber';

describe('reportNumber validation', () => {
  it('formats prefix from date', () => {
    expect(formatReportNumberPrefix(new Date('2025-09-18T10:00:00.000Z'))).toBe(
      'RPT-20250918',
    );
  });

  it('builds padded report numbers', () => {
    expect(buildReportNumber('RPT-20250918', 1)).toBe('RPT-20250918-001');
    expect(buildReportNumber('RPT-20250918', 42)).toBe('RPT-20250918-042');
  });

  it('parses sequence from report number', () => {
    expect(parseReportNumberSequence('RPT-20250918-001')).toBe(1);
    expect(parseReportNumberSequence('INVALID')).toBeNull();
  });

  it('validates report number format', () => {
    expect(validateReportNumber('RPT-20250918-001').valid).toBe(true);
    expect(validateReportNumber('BAD-123').valid).toBe(false);
    expect(validateReportNumber('').valid).toBe(false);
  });
});
