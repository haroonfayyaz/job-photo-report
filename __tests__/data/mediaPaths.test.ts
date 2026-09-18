import {
  buildOriginalPhotoPath,
  buildThumbnailPhotoPath,
  getAppDataRoot,
  getReportDir,
  isOwnedAppPath,
} from '../../src/data/services/mediaPaths';

const DOCUMENT_ROOT = '/mock/documents';

describe('mediaPaths', () => {
  it('builds owned app paths under app-data', () => {
    expect(getAppDataRoot(DOCUMENT_ROOT)).toBe('/mock/documents/app-data');
    expect(getReportDir(DOCUMENT_ROOT, 'report-1')).toBe(
      '/mock/documents/app-data/reports/report-1',
    );
    expect(
      buildOriginalPhotoPath(DOCUMENT_ROOT, 'report-1', 'photo-1', '.jpg'),
    ).toBe(
      '/mock/documents/app-data/reports/report-1/images/photo-1-original.jpg',
    );
    expect(buildThumbnailPhotoPath(DOCUMENT_ROOT, 'report-1', 'photo-1')).toBe(
      '/mock/documents/app-data/reports/report-1/thumbnails/photo-1-thumb.jpg',
    );
  });

  it('only treats app-data paths as owned', () => {
    expect(
      isOwnedAppPath(
        DOCUMENT_ROOT,
        '/mock/documents/app-data/reports/r1/images/a.jpg',
      ),
    ).toBe(true);
    expect(
      isOwnedAppPath(DOCUMENT_ROOT, '/storage/emulated/0/DCIM/photo.jpg'),
    ).toBe(false);
    expect(
      isOwnedAppPath(
        DOCUMENT_ROOT,
        'file:///mock/documents/app-data/temp/staging.jpg',
      ),
    ).toBe(true);
  });
});
