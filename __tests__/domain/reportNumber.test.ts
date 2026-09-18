import {
  buildReportNumber,
  parseReportNumberSequence,
  validateReportNumber,
} from '../../src/domain/validation/reportNumber';

describe('reportNumber validation', () => {
  it('builds padded sequential report numbers', () => {
    expect(buildReportNumber(1)).toBe('RPT-000001');
    expect(buildReportNumber(42)).toBe('RPT-000042');
    expect(buildReportNumber(1000000)).toBe('RPT-1000000');
  });

  it('parses sequence from report number', () => {
    expect(parseReportNumberSequence('RPT-000001')).toBe(1);
    expect(parseReportNumberSequence('RPT-000042')).toBe(42);
    expect(parseReportNumberSequence('INVALID')).toBeNull();
  });

  it('validates report number format', () => {
    expect(validateReportNumber('RPT-000001').valid).toBe(true);
    expect(validateReportNumber('BAD-123').valid).toBe(false);
    expect(validateReportNumber('').valid).toBe(false);
  });
});
