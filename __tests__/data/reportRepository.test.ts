import {
  createPhoto,
  listPhotosByReportId,
} from '../../src/data/repositories/photoRepository';
import {
  createReport,
  deleteReport,
  duplicateReport,
  getReportById,
  listReports,
  searchReports,
  updateReport,
} from '../../src/data/repositories/reportRepository';
import {
  createSection,
  listSectionsByReportId,
} from '../../src/data/repositories/sectionRepository';
import {
  createTestDatabase,
  destroyTestDatabase,
} from '../helpers/sqlJsConnection';

describe('reportRepository', () => {
  beforeEach(async () => {
    await createTestDatabase();
  });

  afterEach(async () => {
    await destroyTestDatabase();
  });

  it('creates and reads a report', () => {
    const created = createReport({
      customerName: 'Smith Residence',
      siteAddress: '12 Oak Street',
      jobReference: 'JOB-100',
    });

    const loaded = getReportById(created.id);
    expect(loaded?.customerName).toBe('Smith Residence');
    expect(loaded?.reportNumber).toMatch(/^RPT-\d{6}$/);
    expect(loaded?.status).toBe('draft');
  });

  it('updates and deletes a report', () => {
    const created = createReport({ customerName: 'Alpha Site' });
    const updated = updateReport(created.id, {
      customerName: 'Beta Site',
      status: 'completed',
    });

    expect(updated?.customerName).toBe('Beta Site');
    expect(updated?.status).toBe('completed');

    expect(deleteReport(created.id)).toBe(true);
    expect(getReportById(created.id)).toBeNull();
  });

  it('searches reports by customer and reference', () => {
    createReport({ customerName: 'Warehouse A', jobReference: 'REF-1' });
    createReport({ customerName: 'Office B', jobReference: 'REF-2' });

    const results = searchReports('warehouse');
    expect(results).toHaveLength(1);
    expect(results[0].customerName).toBe('Warehouse A');
  });

  it('assigns incrementing report numbers without collision', () => {
    const first = createReport({ customerName: 'First' });
    const second = createReport({ customerName: 'Second' });

    const firstSeq = Number(first.reportNumber.replace('RPT-', ''));
    const secondSeq = Number(second.reportNumber.replace('RPT-', ''));
    expect(secondSeq).toBe(firstSeq + 1);
  });

  it('duplicates report metadata with new ids and draft status', () => {
    const source = createReport({
      customerName: 'Dup Test',
      title: 'Inspection',
      generalNotes: 'Note',
    });
    const section = createSection({
      reportId: source.id,
      title: 'Roof',
      notes: 'Damaged shingles',
    });
    createPhoto({
      reportId: source.id,
      sectionId: section.id,
      originalPath: '/photos/original.jpg',
      thumbnailPath: '/photos/thumb.jpg',
      caption: 'North side',
      category: 'ISSUE',
    });

    const copy = duplicateReport(source.id);
    expect(copy).not.toBeNull();
    expect(copy?.id).not.toBe(source.id);
    expect(copy?.reportNumber).not.toBe(source.reportNumber);
    expect(copy?.status).toBe('draft');
    expect(copy?.title).toBe('Copy of Inspection');

    const all = listReports();
    expect(all).toHaveLength(2);

    const copySections = listSectionsByReportId(copy!.id);
    expect(copySections).toHaveLength(1);
    expect(copySections[0].title).toBe('Roof');
    expect(copySections[0].id).not.toBe(section.id);

    const copyPhotos = listPhotosByReportId(copy!.id);
    expect(copyPhotos).toHaveLength(1);
    expect(copyPhotos[0].caption).toBe('North side');
    expect(copyPhotos[0].sectionId).toBe(copySections[0].id);
  });
});
