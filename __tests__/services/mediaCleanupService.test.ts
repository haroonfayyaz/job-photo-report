import RNFS from 'react-native-fs';

import { createPhoto } from '../../src/data/repositories/photoRepository';
import { createReport, listReports } from '../../src/data/repositories/reportRepository';
import {
  cleanupOrphanedTempFiles,
  cleanupUnreferencedReportDirectories,
  deletePhotoWithMedia,
  deleteReportWithMedia,
} from '../../src/services/mediaCleanupService';
import { createTestDatabase, destroyTestDatabase } from '../helpers/sqlJsConnection';

const mockedUnlink = RNFS.unlink as jest.MockedFunction<typeof RNFS.unlink>;
const mockedExists = RNFS.exists as jest.MockedFunction<typeof RNFS.exists>;
const mockedReadDir = RNFS.readDir as jest.MockedFunction<typeof RNFS.readDir>;

describe('mediaCleanupService', () => {
  beforeEach(async () => {
    await createTestDatabase();
    mockedUnlink.mockClear();
    mockedExists.mockResolvedValue(true);
    mockedReadDir.mockResolvedValue([]);
  });

  afterEach(async () => {
    await destroyTestDatabase();
  });

  it('deletes owned photo files and the database record', async () => {
    const report = createReport({ customerName: 'Cleanup Photo' });
    const photo = createPhoto({
      reportId: report.id,
      originalPath: '/mock/documents/app-data/reports/r1/images/p1-original.jpg',
      thumbnailPath:
        '/mock/documents/app-data/reports/r1/thumbnails/p1-thumb.jpg',
    });

    const deleted = await deletePhotoWithMedia(photo.id);

    expect(deleted).toBe(true);
    expect(mockedUnlink).toHaveBeenCalledTimes(2);
  });

  it('does not delete files outside app-data', async () => {
    const report = createReport({ customerName: 'External Path' });
    const photo = createPhoto({
      reportId: report.id,
      originalPath: '/storage/emulated/0/DCIM/photo.jpg',
      thumbnailPath: '/storage/emulated/0/DCIM/thumb.jpg',
    });

    await deletePhotoWithMedia(photo.id);

    expect(mockedUnlink).not.toHaveBeenCalled();
  });

  it('continues report cleanup when file deletion fails', async () => {
    const report = createReport({ customerName: 'Report Cleanup' });
    createPhoto({
      reportId: report.id,
      originalPath: '/mock/documents/app-data/reports/r2/images/p-original.jpg',
    });

    mockedUnlink.mockRejectedValueOnce(new Error('unlink failed'));

    const deleted = await deleteReportWithMedia(report.id);

    expect(deleted).toBe(true);
    expect(listReports()).toHaveLength(0);
  });

  it('removes orphaned temp files', async () => {
    mockedReadDir.mockResolvedValueOnce([
      { name: 'staging-1.jpg', isFile: () => true, isDirectory: () => false },
      { name: 'staging-2.jpg', isFile: () => true, isDirectory: () => false },
    ] as never);

    const removed = await cleanupOrphanedTempFiles();

    expect(removed).toBe(2);
  });

  it('removes report directories that are not referenced in SQLite', async () => {
    const report = createReport({ customerName: 'Kept Report' });
    mockedReadDir.mockResolvedValueOnce([
      { name: report.id, isFile: () => false, isDirectory: () => true },
      { name: 'orphan-id', isFile: () => false, isDirectory: () => true },
    ] as never);

    const removed = await cleanupUnreferencedReportDirectories();

    expect(removed).toBe(1);
    expect(mockedUnlink).toHaveBeenCalled();
  });
});
