import {open, type DB} from '@op-engineering/op-sqlite';

import {DB_NAME, MIGRATIONS, SCHEMA_VERSION} from './schema';

let database: DB | null = null;

export function getDatabase(): DB {
  if (!database) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return database;
}

export function isDatabaseInitialized(): boolean {
  return database !== null;
}

export async function initializeDatabase(): Promise<void> {
  if (database) {
    return;
  }

  database = open({name: DB_NAME});
  database.executeSync('PRAGMA foreign_keys = ON;');

  const versionResult = database.executeSync(
    'SELECT name FROM sqlite_master WHERE type = ? AND name = ?;',
    ['table', 'schema_version'],
  );

  const hasVersionTable =
    versionResult.rows && versionResult.rows.length > 0;

  if (!hasVersionTable) {
    for (const migration of MIGRATIONS) {
      database.executeSync(migration);
    }
    database.executeSync('INSERT INTO schema_version (version) VALUES (?);', [
      SCHEMA_VERSION,
    ]);
    database.executeSync(
      `INSERT OR IGNORE INTO business_profile (id) VALUES (1);`,
    );
    return;
  }

  const currentVersionResult = database.executeSync(
    'SELECT version FROM schema_version LIMIT 1;',
  );
  const currentVersion = Number(currentVersionResult.rows?.[0]?.version ?? 0);

  if (currentVersion < SCHEMA_VERSION) {
    runMigrationsFromVersion(currentVersion);
    database.executeSync('UPDATE schema_version SET version = ?;', [
      SCHEMA_VERSION,
    ]);
  }
}

function runMigrationsFromVersion(fromVersion: number): void {
  if (fromVersion >= SCHEMA_VERSION) {
    return;
  }

  // Future migrations will be added here with version checks.
  // Example: if (fromVersion < 2) { database!.execute('ALTER TABLE ...'); }
}

export function closeDatabase(): void {
  if (database) {
    database.close();
    database = null;
  }
}

/** Reset database for tests only. */
export function resetDatabaseForTests(): void {
  closeDatabase();
}
