import RNFS from 'react-native-fs';

import { createTestDatabase, destroyTestDatabase } from '../helpers/sqlJsConnection';
import { createReport } from '../../src/data/repositories/reportRepository';
import { listPhotosByReportId } from '../../src/data/repositories/photoRepository';
import { MediaStorageError } from '../../src/domain/errors/mediaStorageError';
import { saveImportedPhoto } from '../../src/services/mediaStorageService';

const mockedCopyFile = RNFS.copyFile as jest.MockedFunction<typeof RNFS.copyFile>;
const mockedGetFSInfo = RNFS.getFSInfo as jest.MockedFunction<typeof RNFS.getFSInfo>;

describe('mediaStorageService', () => {
  beforeEach(async () => {
    await createTestDatabase();
    mockedCopyFile.mockReset();
    mockedGetFSInfo.mockResolvedValue({
      totalSpace: 10_000_000_000,
      freeSpace: 5_000_000_000,
    });
  });

  afterEach(async () => {
    await destroyTestDatabase();
  });

  it('rejects imports when storage is low', async () => {
    const report = createReport({ customerName: 'Low Storage' });
    mockedGetFSInfo.mockResolvedValueOnce({
      totalSpace: 10_000_000_000,
      freeSpace: 1024,
    });

    await expect(
      saveImportedPhoto({
        reportId: report.id,
        photoId: 'photo-1',
        sourceUri: 'file:///tmp/photo.jpg',
        extension: '.jpg',
      }),
    ).rejects.toMatchObject({
      code: 'INSUFFICIENT_STORAGE',
    });
  });

  it('does not leave database records when copy fails', async () => {
    const report = createReport({ customerName: 'Copy Failure' });
    mockedCopyFile.mockRejectedValueOnce(new Error('ENOSPC no space left'));

    await expect(
      saveImportedPhoto({
        reportId: report.id,
        photoId: 'photo-2',
        sourceUri: 'file:///tmp/photo.jpg',
        extension: '.jpg',
      }),
    ).rejects.toBeInstanceOf(MediaStorageError);

    expect(listPhotosByReportId(report.id)).toHaveLength(0);
  });
});
