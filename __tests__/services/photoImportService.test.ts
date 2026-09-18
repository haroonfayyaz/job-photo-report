import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import RNFS from 'react-native-fs';

import { createTestDatabase, destroyTestDatabase } from '../helpers/sqlJsConnection';
import { createReport } from '../../src/data/repositories/reportRepository';
import { listPhotosByReportId } from '../../src/data/repositories/photoRepository';
import {
  capturePhotoForReport,
  importPhotosFromGallery,
} from '../../src/services/photoImportService';

const mockedLaunchCamera = launchCamera as jest.MockedFunction<
  typeof launchCamera
>;
const mockedLaunchImageLibrary = launchImageLibrary as jest.MockedFunction<
  typeof launchImageLibrary
>;
const mockedCopyFile = RNFS.copyFile as jest.MockedFunction<typeof RNFS.copyFile>;
const mockedExists = RNFS.exists as jest.MockedFunction<typeof RNFS.exists>;

describe('photoImportService', () => {
  beforeEach(async () => {
    await createTestDatabase();
    mockedCopyFile.mockClear();
    mockedExists.mockResolvedValue(false);
    mockedLaunchCamera.mockReset();
    mockedLaunchImageLibrary.mockReset();
  });

  afterEach(async () => {
    await destroyTestDatabase();
  });

  it('does not create records when the picker is cancelled', async () => {
    const report = createReport({ customerName: 'Cancel Test' });
    mockedLaunchImageLibrary.mockResolvedValue({ didCancel: true, assets: [] });

    const result = await importPhotosFromGallery(report.id);

    expect(result.cancelled).toBe(true);
    expect(result.imported).toHaveLength(0);
    expect(listPhotosByReportId(report.id)).toHaveLength(0);
    expect(mockedCopyFile).not.toHaveBeenCalled();
  });

  it('copies gallery selections into app storage and saves metadata', async () => {
    const report = createReport({ customerName: 'Gallery Test' });
    mockedLaunchImageLibrary.mockResolvedValue({
      didCancel: false,
      assets: [
        {
          uri: 'file:///tmp/one.jpg',
          fileName: 'one.jpg',
          type: 'image/jpeg',
          timestamp: '1700000000000',
        },
        {
          uri: 'file:///tmp/two.jpg',
          fileName: 'two.jpg',
          type: 'image/jpeg',
        },
      ],
    });

    const result = await importPhotosFromGallery(report.id);

    expect(result.cancelled).toBe(false);
    expect(result.imported).toHaveLength(2);
    expect(mockedCopyFile).toHaveBeenCalledTimes(4);
    expect(listPhotosByReportId(report.id)).toHaveLength(2);
    expect(result.imported[0].originalPath).toContain('/images/');
    expect(result.imported[0].originalPath).not.toContain('base64');
  });

  it('saves a captured camera photo', async () => {
    const report = createReport({ customerName: 'Camera Test' });
    mockedLaunchCamera.mockResolvedValue({
      didCancel: false,
      assets: [
        {
          uri: 'file:///tmp/camera.jpg',
          fileName: 'camera.jpg',
          type: 'image/jpeg',
        },
      ],
    });

    const result = await capturePhotoForReport(report.id);

    expect(result.imported).toHaveLength(1);
    expect(listPhotosByReportId(report.id)).toHaveLength(1);
  });
});
