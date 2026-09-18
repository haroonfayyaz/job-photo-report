/* eslint-env jest */

jest.mock('@op-engineering/op-sqlite', () => ({
  open: jest.fn(() => ({
    executeSync: jest.fn(() => ({ rows: [], rowsAffected: 0 })),
    close: jest.fn(),
  })),
}));

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  exists: jest.fn(async () => false),
  mkdir: jest.fn(async () => undefined),
  copyFile: jest.fn(async () => undefined),
  moveFile: jest.fn(async () => undefined),
  unlink: jest.fn(async () => undefined),
  readDir: jest.fn(async () => []),
  getFSInfo: jest.fn(async () => ({
    totalSpace: 10_000_000_000,
    freeSpace: 5_000_000_000,
  })),
}));

jest.mock('@bam.tech/react-native-image-resizer', () => ({
  createResizedImage: jest.fn(async () => ({
    path: '/mock/documents/cache/thumb.jpg',
    uri: 'file:///mock/documents/cache/thumb.jpg',
    name: 'thumb.jpg',
    size: 1024,
  })),
}));

jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));
