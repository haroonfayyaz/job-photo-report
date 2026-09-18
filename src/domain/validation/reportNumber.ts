export const REPORT_NUMBER_PREFIX = 'RPT';
const REPORT_NUMBER_PATTERN = /^RPT-\d{6,}$/;

export interface ReportNumberValidationResult {
  valid: boolean;
  error?: string;
}

export function buildReportNumber(sequence: number, padLength = 6): string {
  const padded = String(sequence).padStart(padLength, '0');
  return `${REPORT_NUMBER_PREFIX}-${padded}`;
}

export function parseReportNumberSequence(reportNumber: string): number | null {
  const match = reportNumber.match(/^RPT-(\d+)$/);
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
      error: 'Report number must match RPT-###### format.',
    };
  }

  const sequence = parseReportNumberSequence(trimmed);
  if (sequence === null || sequence < 1) {
    return { valid: false, error: 'Report number sequence must be positive.' };
  }

  return { valid: true };
}
