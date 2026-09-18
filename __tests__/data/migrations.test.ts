import {
  getLatestSchemaVersion,
  runMigrations,
} from '../../src/data/database/migrations';
import { METADATA_KEYS } from '../../src/data/database/schema';
import {
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
});
