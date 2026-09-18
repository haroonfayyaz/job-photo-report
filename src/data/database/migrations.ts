import type { DatabaseConnection } from './types';
import { METADATA_KEYS, SCHEMA_VERSION } from './schema';

type Migration = {
  version: number;
  statements: string[];
};

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS app_metadata (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY NOT NULL,
        report_number TEXT NOT NULL UNIQUE,
        template_key TEXT NOT NULL DEFAULT 'general',
        title TEXT NOT NULL DEFAULT '',
        customer_name TEXT NOT NULL,
        site_address TEXT NOT NULL DEFAULT '',
        job_reference TEXT NOT NULL DEFAULT '',
        technician_name TEXT NOT NULL DEFAULT '',
        report_date TEXT NOT NULL,
        general_notes TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'draft',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );`,
      `CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);`,
      `CREATE INDEX IF NOT EXISTS idx_reports_updated_at ON reports(updated_at DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_reports_customer_name ON reports(customer_name);`,
      `CREATE TABLE IF NOT EXISTS report_sections (
        id TEXT PRIMARY KEY NOT NULL,
        report_id TEXT NOT NULL,
        title TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
      );`,
      `CREATE INDEX IF NOT EXISTS idx_sections_report_id ON report_sections(report_id);`,
      `CREATE TABLE IF NOT EXISTS report_photos (
        id TEXT PRIMARY KEY NOT NULL,
        report_id TEXT NOT NULL,
        section_id TEXT,
        original_path TEXT NOT NULL,
        thumbnail_path TEXT,
        caption TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT 'UNCATEGORIZED',
        sort_order INTEGER NOT NULL DEFAULT 0,
        captured_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
        FOREIGN KEY (section_id) REFERENCES report_sections(id) ON DELETE SET NULL
      );`,
      `CREATE INDEX IF NOT EXISTS idx_photos_report_id ON report_photos(report_id);`,
      `CREATE INDEX IF NOT EXISTS idx_photos_section_id ON report_photos(section_id);`,
      `CREATE TABLE IF NOT EXISTS signatures (
        id TEXT PRIMARY KEY NOT NULL,
        report_id TEXT NOT NULL UNIQUE,
        signer_name TEXT NOT NULL,
        local_path TEXT NOT NULL,
        signed_at TEXT NOT NULL,
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
      );`,
      `CREATE TABLE IF NOT EXISTS business_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        company_name TEXT NOT NULL DEFAULT '',
        logo_path TEXT,
        phone TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        website TEXT NOT NULL DEFAULT '',
        address TEXT NOT NULL DEFAULT '',
        default_technician_name TEXT NOT NULL DEFAULT ''
      );`,
      `INSERT OR IGNORE INTO business_profile (id) VALUES (1);`,
    ],
  },
];

function getStoredVersion(db: DatabaseConnection): number {
  ensureMetadataTable(db);
  const result = db.execute(
    'SELECT value FROM app_metadata WHERE key = ? LIMIT 1;',
    [METADATA_KEYS.schemaVersion],
  );
  const value = result.rows[0]?.value;
  return value ? Number.parseInt(String(value), 10) : 0;
}

function setStoredVersion(db: DatabaseConnection, version: number): void {
  db.execute(
    `INSERT INTO app_metadata (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
    [METADATA_KEYS.schemaVersion, String(version)],
  );
}

function ensureMetadataTable(db: DatabaseConnection): void {
  db.execute(`CREATE TABLE IF NOT EXISTS app_metadata (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );`);
}

export function runMigrations(db: DatabaseConnection): void {
  db.execute('PRAGMA foreign_keys = ON;');

  const currentVersion = getStoredVersion(db);

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) {
      continue;
    }

    db.transaction(() => {
      for (const statement of migration.statements) {
        db.execute(statement);
      }
      setStoredVersion(db, migration.version);
    });
  }

}

export function getLatestSchemaVersion(): number {
  return SCHEMA_VERSION;
}
