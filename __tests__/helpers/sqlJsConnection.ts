import path from 'path';

import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';

import { initializeDatabase, setDatabaseForTests } from '../../src/data/database/database';
import type { DatabaseConnection, QueryResult, SqlValue } from '../../src/data/database/types';

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs({
      locateFile: (file: string) =>
        path.join(__dirname, '../../node_modules/sql.js/dist', file),
    });
  }
  return sqlJsPromise;
}

function wrapDatabase(db: Database): DatabaseConnection {
  return {
    execute(sql: string, params: SqlValue[] = []): QueryResult {
      const upper = sql.trim().toUpperCase();
      const isQuery =
        upper.startsWith('SELECT') || upper.startsWith('PRAGMA');

      if (isQuery) {
        const stmt = db.prepare(sql);
        if (params.length > 0) {
          stmt.bind(params);
        }

        const rows: Record<string, SqlValue>[] = [];
        while (stmt.step()) {
          const row = stmt.getAsObject() as Record<string, SqlValue>;
          const mapped: Record<string, SqlValue> = {};
          for (const [key, value] of Object.entries(row)) {
            if (key) {
              mapped[key] = value as SqlValue;
            }
          }
          rows.push(mapped);
        }
        stmt.free();
        return { rows, rowsAffected: 0 };
      }

      db.run(sql, params);
      return { rows: [], rowsAffected: db.getRowsModified() };
    },
    transaction<T>(fn: () => T): T {
      db.run('BEGIN IMMEDIATE;');
      try {
        const result = fn();
        db.run('COMMIT;');
        return result;
      } catch (error) {
        db.run('ROLLBACK;');
        throw error;
      }
    },
    close(): void {
      db.close();
    },
  };
}

export async function createRawTestDatabase(): Promise<DatabaseConnection> {
  const SQL = await getSqlJs();
  const db = new SQL.Database();
  return wrapDatabase(db);
}

export async function createTestDatabase(): Promise<DatabaseConnection> {
  const connection = await createRawTestDatabase();
  initializeDatabase(connection);
  setDatabaseForTests(connection);
  return connection;
}

export async function destroyTestDatabase(): Promise<void> {
  setDatabaseForTests(null);
}
