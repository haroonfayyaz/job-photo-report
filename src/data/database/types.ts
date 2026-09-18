export type SqlValue = string | number | null;

export interface QueryResult {
  rows: Record<string, SqlValue>[];
  rowsAffected: number;
  insertId?: number;
}

export interface DatabaseConnection {
  execute(sql: string, params?: SqlValue[]): QueryResult;
  transaction<T>(fn: () => T): T;
  close(): void;
}
