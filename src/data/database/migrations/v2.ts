import {
  addColumnIfMissing,
  getTableColumns,
  tableExists,
} from '../schemaIntrospection';
import type { DatabaseConnection } from '../types';

/**
 * Upgrades databases created by an earlier bootstrap that used
 * report_type / address / reference_number instead of the current columns.
 */
export function migrateToV2(db: DatabaseConnection): void {
  if (!tableExists(db, 'reports')) {
    return;
  }

  const columns = getTableColumns(db, 'reports');

  addColumnIfMissing(
    db,
    'reports',
    'title',
    "TEXT NOT NULL DEFAULT ''",
    columns,
  );
  addColumnIfMissing(
    db,
    'reports',
    'template_key',
    "TEXT NOT NULL DEFAULT 'general'",
    columns,
  );
  addColumnIfMissing(
    db,
    'reports',
    'site_address',
    "TEXT NOT NULL DEFAULT ''",
    columns,
  );
  addColumnIfMissing(
    db,
    'reports',
    'job_reference',
    "TEXT NOT NULL DEFAULT ''",
    columns,
  );

  if (columns.has('report_type')) {
    db.execute(
      `UPDATE reports
       SET template_key = COALESCE(NULLIF(report_type, ''), 'general')
       WHERE template_key = 'general' OR template_key = '' OR template_key IS NULL;`,
    );
  }

  if (columns.has('address')) {
    db.execute(
      `UPDATE reports
       SET site_address = COALESCE(address, '')
       WHERE site_address = '' OR site_address IS NULL;`,
    );
  }

  if (columns.has('reference_number')) {
    db.execute(
      `UPDATE reports
       SET job_reference = COALESCE(reference_number, '')
       WHERE job_reference = '' OR job_reference IS NULL;`,
    );
  }

  db.execute(
    `UPDATE reports
     SET title = customer_name
     WHERE title = '' OR title IS NULL;`,
  );
}
