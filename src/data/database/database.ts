import { runMigrations } from './migrations';
import { DB_NAME } from './schema';
import type { DatabaseConnection } from './types';

let connection: DatabaseConnection | null = null;

function createProductionConnection(): DatabaseConnection {
  const { createOpSqliteConnection } =
    require('./opSqliteConnection') as typeof import('./opSqliteConnection');
  return createOpSqliteConnection(DB_NAME);
}

export function initializeDatabase(
  externalConnection?: DatabaseConnection,
): DatabaseConnection {
  if (connection && !externalConnection) {
    return connection;
  }

  const db = externalConnection ?? createProductionConnection();
  runMigrations(db);

  if (!externalConnection) {
    connection = db;
  }

  return db;
}

export function getDatabase(): DatabaseConnection {
  if (!connection) {
    throw new Error(
      'Database not initialized. Call initializeDatabase() during app startup.',
    );
  }
  return connection;
}

export function isDatabaseInitialized(): boolean {
  return connection !== null;
}

export function setDatabaseForTests(db: DatabaseConnection | null): void {
  if (connection && connection !== db) {
    connection.close();
  }
  connection = db;
}

export function resetDatabaseForTests(): void {
  if (connection) {
    connection.close();
    connection = null;
  }
}
