import { toUTCString } from '../../../domain/dates';
import {
  addColumnIfMissing,
  getTableColumns,
  tableExists,
} from '../schemaIntrospection';
import type { DatabaseConnection } from '../types';

const LEGACY_TIMESTAMP = '1970-01-01T00:00:00.000Z';

function backfillTimestamps(
  db: DatabaseConnection,
  table: string,
  timestamp: string,
): void {
  db.execute(
    `UPDATE ${table}
     SET created_at = ?
     WHERE created_at IS NULL OR created_at = '' OR created_at = ?;`,
    [timestamp, LEGACY_TIMESTAMP],
  );
  db.execute(
    `UPDATE ${table}
     SET updated_at = ?
     WHERE updated_at IS NULL OR updated_at = '' OR updated_at = ?;`,
    [timestamp, LEGACY_TIMESTAMP],
  );
}

function migrateLegacyReportSections(db: DatabaseConnection): void {
  if (!tableExists(db, 'report_sections')) {
    return;
  }

  const columns = getTableColumns(db, 'report_sections');
  const now = toUTCString();

  addColumnIfMissing(
    db,
    'report_sections',
    'title',
    "TEXT NOT NULL DEFAULT ''",
    columns,
  );
  addColumnIfMissing(
    db,
    'report_sections',
    'notes',
    "TEXT NOT NULL DEFAULT ''",
    columns,
  );
  addColumnIfMissing(
    db,
    'report_sections',
    'sort_order',
    'INTEGER NOT NULL DEFAULT 0',
    columns,
  );
  addColumnIfMissing(
    db,
    'report_sections',
    'created_at',
    `TEXT NOT NULL DEFAULT '${LEGACY_TIMESTAMP}'`,
    columns,
  );
  addColumnIfMissing(
    db,
    'report_sections',
    'updated_at',
    `TEXT NOT NULL DEFAULT '${LEGACY_TIMESTAMP}'`,
    columns,
  );

  if (columns.has('name')) {
    db.execute(
      `UPDATE report_sections
       SET title = COALESCE(NULLIF(name, ''), title, '')
       WHERE title = '' OR title IS NULL;`,
    );
  }

  if (columns.has('description')) {
    db.execute(
      `UPDATE report_sections
       SET notes = COALESCE(description, '')
       WHERE notes = '' OR notes IS NULL;`,
    );
  }

  backfillTimestamps(db, 'report_sections', now);
}

function migrateLegacyReportPhotos(db: DatabaseConnection): void {
  if (!tableExists(db, 'report_photos')) {
    return;
  }

  const columns = getTableColumns(db, 'report_photos');
  const now = toUTCString();

  addColumnIfMissing(
    db,
    'report_photos',
    'section_id',
    'TEXT',
    columns,
  );
  addColumnIfMissing(
    db,
    'report_photos',
    'thumbnail_path',
    'TEXT',
    columns,
  );
  addColumnIfMissing(
    db,
    'report_photos',
    'caption',
    "TEXT NOT NULL DEFAULT ''",
    columns,
  );
  addColumnIfMissing(
    db,
    'report_photos',
    'category',
    "TEXT NOT NULL DEFAULT 'UNCATEGORIZED'",
    columns,
  );
  addColumnIfMissing(
    db,
    'report_photos',
    'sort_order',
    'INTEGER NOT NULL DEFAULT 0',
    columns,
  );
  addColumnIfMissing(
    db,
    'report_photos',
    'captured_at',
    `TEXT NOT NULL DEFAULT '${LEGACY_TIMESTAMP}'`,
    columns,
  );
  addColumnIfMissing(
    db,
    'report_photos',
    'created_at',
    `TEXT NOT NULL DEFAULT '${LEGACY_TIMESTAMP}'`,
    columns,
  );
  addColumnIfMissing(
    db,
    'report_photos',
    'updated_at',
    `TEXT NOT NULL DEFAULT '${LEGACY_TIMESTAMP}'`,
    columns,
  );
  addColumnIfMissing(
    db,
    'report_photos',
    'original_path',
    "TEXT NOT NULL DEFAULT ''",
    columns,
  );

  if (columns.has('path') || columns.has('local_path')) {
    const legacyPathColumn = columns.has('path') ? 'path' : 'local_path';
    db.execute(
      `UPDATE report_photos
       SET original_path = COALESCE(${legacyPathColumn}, '')
       WHERE original_path = '' OR original_path IS NULL;`,
    );
  }

  db.execute(
    `UPDATE report_photos
     SET captured_at = COALESCE(created_at, ?)
     WHERE captured_at IS NULL OR captured_at = '' OR captured_at = ?;`,
    [now, LEGACY_TIMESTAMP],
  );

  backfillTimestamps(db, 'report_photos', now);
}

/**
 * Upgrades legacy section/photo tables created before the current schema.
 */
export function migrateToV3(db: DatabaseConnection): void {
  migrateLegacyReportSections(db);
  migrateLegacyReportPhotos(db);
}
