export const DB_NAME = 'job_photo_report.db';
export const SCHEMA_VERSION = 1;

export const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY NOT NULL,
    report_number TEXT NOT NULL UNIQUE,
    report_type TEXT NOT NULL DEFAULT 'general',
    customer_name TEXT NOT NULL,
    address TEXT NOT NULL DEFAULT '',
    reference_number TEXT NOT NULL DEFAULT '',
    technician_name TEXT NOT NULL DEFAULT '',
    report_date TEXT NOT NULL,
    general_notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft',
    signature_path TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);`,
  `CREATE INDEX IF NOT EXISTS idx_reports_updated_at ON reports(updated_at DESC);`,
  `CREATE TABLE IF NOT EXISTS report_sections (
    id TEXT PRIMARY KEY NOT NULL,
    report_id TEXT NOT NULL,
    title TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
  );`,
  `CREATE INDEX IF NOT EXISTS idx_sections_report_id ON report_sections(report_id);`,
  `CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY NOT NULL,
    report_id TEXT NOT NULL,
    section_id TEXT,
    original_path TEXT NOT NULL,
    thumbnail_path TEXT,
    caption TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'UNCATEGORIZED',
    sort_order INTEGER NOT NULL DEFAULT 0,
    captured_at TEXT NOT NULL,
    annotation_path TEXT,
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES report_sections(id) ON DELETE SET NULL
  );`,
  `CREATE INDEX IF NOT EXISTS idx_photos_report_id ON photos(report_id);`,
  `CREATE INDEX IF NOT EXISTS idx_photos_section_id ON photos(section_id);`,
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
  `CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );`,
];
