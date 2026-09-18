import { buildReportNumber } from '../../domain/validation/reportNumber';
import { METADATA_KEYS } from '../database/schema';
import type { DatabaseConnection } from '../database/types';

export function allocateNextReportNumber(db: DatabaseConnection): string {
  const result = db.execute(
    'SELECT value FROM app_metadata WHERE key = ? LIMIT 1;',
    [METADATA_KEYS.reportNumberCounter],
  );

  const stored = result.rows[0]?.value;
  const current = stored ? Number.parseInt(String(stored), 10) : 0;
  const next = Number.isNaN(current) ? 1 : current + 1;

  db.execute(
    `INSERT INTO app_metadata (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
    [METADATA_KEYS.reportNumberCounter, String(next)],
  );

  return buildReportNumber(next);
}

export function getNextReportNumber(db: DatabaseConnection): string {
  return db.transaction(() => allocateNextReportNumber(db));
}
