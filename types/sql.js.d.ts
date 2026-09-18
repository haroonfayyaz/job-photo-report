declare module 'sql.js' {
  export interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => Database;
  }

  export interface Database {
    run(sql: string, params?: unknown[]): void;
    prepare(sql: string): Statement;
    getRowsModified(): number;
    close(): void;
  }

  export interface Statement {
    bind(params?: unknown[]): void;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    get(): unknown[];
    getColumnNames(): string[];
    free(): void;
  }

  export default function initSqlJs(config?: {
    locateFile?: (file: string) => string;
  }): Promise<SqlJsStatic>;
}
