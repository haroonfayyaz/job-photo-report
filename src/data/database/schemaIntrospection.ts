import type { DatabaseConnection } from './types';

export function getTableColumns(
  db: DatabaseConnection,
  table: string,
): Set<string> {
  const result = db.execute(`PRAGMA table_info(${table});`);
  return new Set(
    result.rows
      .map(row => row.name)
      .filter((name): name is string => name != null)
      .map(String),
  );
}

export function tableExists(db: DatabaseConnection, table: string): boolean {
  const result = db.execute(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ? LIMIT 1;`,
    [table],
  );
  return result.rows.length > 0;
}

export function addColumnIfMissing(
  db: DatabaseConnection,
  table: string,
  column: string,
  definition: string,
  columns: Set<string>,
): void {
  if (!columns.has(column)) {
    db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
    columns.add(column);
  }
}
