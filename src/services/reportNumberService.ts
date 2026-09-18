import {toISODate} from '../utils/dates';

export function formatReportNumberPrefix(date: Date = new Date()): string {
  const isoDate = toISODate(date).replace(/-/g, '');
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
