import { createReport } from '../../src/data/repositories/reportRepository';
import {
  createPhoto,
  listPhotosByReportId,
  reorderPhotos,
} from '../../src/data/repositories/photoRepository';
import { createSection } from '../../src/data/repositories/sectionRepository';
import {
  createTestDatabase,
  destroyTestDatabase,
} from '../helpers/sqlJsConnection';

describe('photoRepository', () => {
  beforeEach(async () => {
    await createTestDatabase();
  });

  afterEach(async () => {
    await destroyTestDatabase();
  });

  it('stores path metadata only and supports reordering', () => {
    const report = createReport({ customerName: 'Photo Test' });
    const section = createSection({ reportId: report.id, title: 'Area 1' });

    const photoB = createPhoto({
      reportId: report.id,
      sectionId: section.id,
      originalPath: '/files/b.jpg',
      caption: 'B',
    });
    const photoA = createPhoto({
      reportId: report.id,
      sectionId: section.id,
      originalPath: '/files/a.jpg',
      caption: 'A',
    });

    reorderPhotos(report.id, [photoA.id, photoB.id]);
    const photos = listPhotosByReportId(report.id);

    expect(photos.map(p => p.caption)).toEqual(['A', 'B']);
    expect(photos.every(p => !p.originalPath.includes('base64'))).toBe(true);
  });
});
