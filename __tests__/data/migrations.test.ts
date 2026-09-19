import {
  getLatestSchemaVersion,
  runMigrations,
} from '../../src/data/database/migrations';
import { METADATA_KEYS } from '../../src/data/database/schema';
import {
  createRawTestDatabase,
  createTestDatabase,
  destroyTestDatabase,
} from '../helpers/sqlJsConnection';

describe('database migrations', () => {
  afterEach(async () => {
    await destroyTestDatabase();
  });

  it('initializes schema version metadata', async () => {
    const db = await createTestDatabase();
    const result = db.execute(
      'SELECT value FROM app_metadata WHERE key = ?;',
      [METADATA_KEYS.schemaVersion],
    );
    expect(Number(result.rows[0]?.value)).toBe(getLatestSchemaVersion());
  });

  it('is idempotent when migrations run twice', async () => {
    const db = await createTestDatabase();
    runMigrations(db);
    runMigrations(db);

    const tables = db.execute(
      `SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;`,
    );
    const names = tables.rows.map(row => String(row.name));
    expect(names).toContain('reports');
    expect(names).toContain('report_sections');
    expect(names).toContain('report_photos');
    expect(names).toContain('signatures');
    expect(names).toContain('business_profile');
  });

  it('starts with an empty reports table', async () => {
    const db = await createTestDatabase();
    const result = db.execute('SELECT COUNT(*) AS count FROM reports;');
    expect(Number(result.rows[0]?.count)).toBe(0);
  });

  it('migrates legacy reports columns to the current schema', async () => {
    const db = await createRawTestDatabase();

    db.execute(`CREATE TABLE app_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );`);
    db.execute(
      `INSERT INTO app_metadata (key, value) VALUES (?, ?);`,
      [METADATA_KEYS.schemaVersion, '1'],
    );
    db.execute(`CREATE TABLE reports (
      id TEXT PRIMARY KEY NOT NULL,
      report_number TEXT NOT NULL UNIQUE,
      report_type TEXT NOT NULL DEFAULT 'inspection',
      customer_name TEXT NOT NULL,
      address TEXT NOT NULL DEFAULT '123 Main St',
      reference_number TEXT NOT NULL DEFAULT 'JOB-42',
      technician_name TEXT NOT NULL DEFAULT 'Alex',
      report_date TEXT NOT NULL,
      general_notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      signature_path TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );`);
    db.execute(
      `INSERT INTO reports (
        id, report_number, report_type, customer_name, address, reference_number,
        technician_name, report_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        'legacy-1',
        'RPT-000001',
        'inspection',
        'Acme Corp',
        '123 Main St',
        'JOB-42',
        'Alex',
        '2026-09-18',
        '2026-09-18T00:00:00.000Z',
        '2026-09-18T00:00:00.000Z',
      ],
    );

    runMigrations(db);

    const columns = db.execute('PRAGMA table_info(reports);');
    const names = columns.rows.map(row => String(row.name));
    expect(names).toContain('template_key');
    expect(names).toContain('title');
    expect(names).toContain('site_address');
    expect(names).toContain('job_reference');

    const row = db.execute(
      `SELECT template_key, title, site_address, job_reference
       FROM reports WHERE id = ?;`,
      ['legacy-1'],
    );
    expect(row.rows[0]).toMatchObject({
      template_key: 'inspection',
      title: 'Acme Corp',
      site_address: '123 Main St',
      job_reference: 'JOB-42',
    });

    const version = db.execute(
      'SELECT value FROM app_metadata WHERE key = ?;',
      [METADATA_KEYS.schemaVersion],
    );
    expect(Number(version.rows[0]?.value)).toBe(getLatestSchemaVersion());
  });

  it('migrates legacy report_sections columns to the current schema', async () => {
    const db = await createRawTestDatabase();

    db.execute(`CREATE TABLE app_metadata (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );`);
    db.execute(
      `INSERT INTO app_metadata (key, value) VALUES (?, ?);`,
      [METADATA_KEYS.schemaVersion, '2'],
    );
    db.execute(`CREATE TABLE reports (
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
    );`);
    db.execute(`CREATE TABLE report_sections (
      id TEXT PRIMARY KEY NOT NULL,
      report_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT 'Old notes'
    );`);
    db.execute(
      `INSERT INTO report_sections (id, report_id, title, description)
       VALUES (?, ?, ?, ?);`,
      ['section-1', 'report-1', 'Kitchen', 'Under sink leak'],
    );

    runMigrations(db);

    const columns = db.execute('PRAGMA table_info(report_sections);');
    const names = columns.rows.map(row => String(row.name));
    expect(names).toContain('created_at');
    expect(names).toContain('updated_at');
    expect(names).toContain('notes');
    expect(names).toContain('sort_order');

    const row = db.execute(
      `SELECT notes, created_at, updated_at FROM report_sections WHERE id = ?;`,
      ['section-1'],
    );
    expect(row.rows[0]?.notes).toBe('Under sink leak');
    expect(String(row.rows[0]?.created_at)).not.toBe('');
    expect(String(row.rows[0]?.updated_at)).not.toBe('');

    const version = db.execute(
      'SELECT value FROM app_metadata WHERE key = ?;',
      [METADATA_KEYS.schemaVersion],
    );
    expect(Number(version.rows[0]?.value)).toBe(getLatestSchemaVersion());
  });
});
