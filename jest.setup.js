/* eslint-env jest */
jest.mock('@op-engineering/op-sqlite', () => {
  const databases = new Map();

  function createInMemoryDb() {
    const tables = new Map();

    return {
      executeSync(query, params = []) {
        const sql = query.trim().replace(/\s+/g, ' ');

        if (sql.startsWith('PRAGMA')) {
          return {rowsAffected: 0, rows: []};
        }

        if (sql.startsWith('CREATE TABLE') || sql.startsWith('CREATE INDEX')) {
          const tableName = sql.match(
            /(?:TABLE|INDEX) IF NOT EXISTS ([^\s(]+)/i,
          )?.[1];
          if (tableName && !tables.has(tableName)) {
            tables.set(tableName, []);
          }
          return {rowsAffected: 0, rows: []};
        }

        if (sql.startsWith('INSERT INTO schema_version')) {
          tables.set('schema_version', [{version: params[0]}]);
          return {rowsAffected: 1, rows: []};
        }

        if (sql.startsWith('INSERT OR IGNORE INTO business_profile')) {
          if (!tables.has('business_profile')) {
            tables.set('business_profile', [{id: 1}]);
          }
          return {rowsAffected: 1, rows: []};
        }

        if (sql.startsWith('SELECT name FROM sqlite_master')) {
          const exists = tables.has(params[1]);
          return {
            rowsAffected: 0,
            rows: exists ? [{name: params[1]}] : [],
          };
        }

        if (sql.startsWith('SELECT version FROM schema_version')) {
          const rows = tables.get('schema_version') ?? [];
          return {rowsAffected: 0, rows};
        }

        return {rowsAffected: 0, rows: []};
      },
      close() {},
    };
  }

  return {
    open: ({name}) => {
      if (!databases.has(name)) {
        databases.set(name, createInMemoryDb());
      }
      return databases.get(name);
    },
  };
});

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  exists: jest.fn(async () => false),
  mkdir: jest.fn(async () => undefined),
  unlink: jest.fn(async () => undefined),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useFocusEffect: jest.fn(),
  };
});
