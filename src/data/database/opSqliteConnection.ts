import { open, type DB, type QueryResult as OpQueryResult } from '@op-engineering/op-sqlite';

import type { DatabaseConnection, QueryResult, SqlValue } from './types';

function toSqlValue(value: unknown): SqlValue {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  return String(value);
}

function mapResult(result: OpQueryResult): QueryResult {
  return {
    rows: (result.rows ?? []).map(row => {
      const mapped: Record<string, SqlValue> = {};
      for (const [key, value] of Object.entries(row)) {
        mapped[key] = toSqlValue(value);
      }
      return mapped;
    }),
    rowsAffected: result.rowsAffected ?? 0,
    insertId: result.insertId,
  };
}

export function createOpSqliteConnection(name: string): DatabaseConnection {
  const db: DB = open({ name });

  return {
    execute(sql: string, params: SqlValue[] = []): QueryResult {
      return mapResult(db.executeSync(sql, params));
    },
    transaction<T>(fn: () => T): T {
      db.executeSync('BEGIN IMMEDIATE;');
      try {
        const result = fn();
        db.executeSync('COMMIT;');
        return result;
      } catch (error) {
        db.executeSync('ROLLBACK;');
        throw error;
      }
    },
    close(): void {
      db.close();
    },
  };
}
