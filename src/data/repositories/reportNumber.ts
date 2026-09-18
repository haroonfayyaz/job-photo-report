import {
  buildReportNumber,
  formatReportNumberPrefix,
  parseReportNumberSequence,
} from '../../domain/validation/reportNumber';
import type { DatabaseConnection } from '../database/types';

export function getNextReportNumber(db: DatabaseConnection): string {
  const prefix = formatReportNumberPrefix();
  const result = db.execute(
    `SELECT report_number FROM reports
     WHERE report_number LIKE ?
     ORDER BY report_number DESC
     LIMIT 1;`,
    [`${prefix}-%`],
  );

  const latest = result.rows[0]?.report_number;
  if (!latest) {
    return buildReportNumber(prefix, 1);
  }

  const sequence = parseReportNumberSequence(String(latest));
  return buildReportNumber(prefix, sequence ? sequence + 1 : 1);
}
