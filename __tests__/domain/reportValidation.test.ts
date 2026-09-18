import {
  validateBusinessProfileContact,
  validateCreateReportInput,
  validateReportNumberField,
  validateUpdateReportInput,
} from '../../src/domain/validation/report';

describe('report validation', () => {
  it('requires customer name on create', () => {
    const result = validateCreateReportInput({ customerName: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.customerName).toBeTruthy();
  });

  it('accepts valid create input', () => {
    const result = validateCreateReportInput({
      customerName: 'Smith Residence',
      reportDate: '2025-09-18',
    });
    expect(result.valid).toBe(true);
  });

  it('rejects invalid report date on update', () => {
    const result = validateUpdateReportInput({ reportDate: 'not-a-date' });
    expect(result.valid).toBe(false);
    expect(result.errors.reportDate).toBeTruthy();
  });

  it('validates report number field', () => {
    expect(validateReportNumberField('RPT-20250918-001').valid).toBe(true);
    expect(validateReportNumberField('bad').valid).toBe(false);
  });

  it('validates optional business contact fields', () => {
    expect(
      validateBusinessProfileContact('user@example.com', '+1 555 123 4567').valid,
    ).toBe(true);
    expect(validateBusinessProfileContact('not-an-email', 'abc').valid).toBe(
      false,
    );
  });
});
