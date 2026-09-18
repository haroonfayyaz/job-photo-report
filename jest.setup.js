/* eslint-env jest */

jest.mock('@op-engineering/op-sqlite', () => ({
  open: jest.fn(() => ({
    executeSync: jest.fn(() => ({ rows: [], rowsAffected: 0 })),
    close: jest.fn(),
  })),
}));
