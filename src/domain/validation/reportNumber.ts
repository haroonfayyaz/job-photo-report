const REPORT_NUMBER_PATTERN = /^RPT-\d{8}-\d{3,}$/;

export interface ReportNumberValidationResult {
  valid: boolean;
  error?: string;
}

export function formatReportNumberPrefix(date: Date = new Date()): string {
  const isoDate = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `RPT-${isoDate}`;
}

export function buildReportNumber(
  prefix: string,
  sequence: number,
  padLength = 3,
): string {
  const padded = String(sequence).padStart(padLength, '0');
  return `${prefix}-${padded}`;
}

export function parseReportNumberSequence(reportNumber: string): number | null {
  const match = reportNumber.match(/-(\d+)$/);
  if (!match) {
    return null;
  }
  const sequence = Number.parseInt(match[1], 10);
  return Number.isNaN(sequence) ? null : sequence;
}

export function validateReportNumber(
  reportNumber: string,
): ReportNumberValidationResult {
  const trimmed = reportNumber.trim();

  if (!trimmed) {
    return { valid: false, error: 'Report number is required.' };
  }

  if (!REPORT_NUMBER_PATTERN.test(trimmed)) {
    return {
      valid: false,
      error: 'Report number must match RPT-YYYYMMDD-### format.',
    };
  }

  const sequence = parseReportNumberSequence(trimmed);
  if (sequence === null || sequence < 1) {
    return { valid: false, error: 'Report number sequence must be positive.' };
  }

  return { valid: true };
}
