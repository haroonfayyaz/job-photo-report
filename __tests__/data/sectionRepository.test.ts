import { createReport } from '../../src/data/repositories/reportRepository';
import { createPhoto } from '../../src/data/repositories/photoRepository';
import {
  createSection,
  deleteSectionIfEmpty,
  listSectionsByReportId,
  reorderSections,
  updateSection,
} from '../../src/data/repositories/sectionRepository';
import {
  createTestDatabase,
  destroyTestDatabase,
} from '../helpers/sqlJsConnection';

describe('sectionRepository', () => {
  beforeEach(async () => {
    await createTestDatabase();
  });

  afterEach(async () => {
    await destroyTestDatabase();
  });

  it('lists sections ordered by sortOrder', () => {
    const report = createReport({ customerName: 'Ordering Test' });
    const second = createSection({ reportId: report.id, title: 'Second' });
    const first = createSection({ reportId: report.id, title: 'First' });

    reorderSections(report.id, [first.id, second.id]);
    const sections = listSectionsByReportId(report.id);

    expect(sections.map(s => s.title)).toEqual(['First', 'Second']);
    expect(sections[0].sortOrder).toBe(0);
    expect(sections[1].sortOrder).toBe(1);
  });

  it('updates section title and notes', () => {
    const report = createReport({ customerName: 'Section Edit' });
    const section = createSection({
      reportId: report.id,
      title: 'Roof',
      notes: 'Old notes',
    });

    const updated = updateSection(section.id, {
      title: 'Roof Area',
      notes: 'Checked flashing',
    });

    expect(updated?.title).toBe('Roof Area');
    expect(updated?.notes).toBe('Checked flashing');
  });

  it('only deletes empty sections', () => {
    const report = createReport({ customerName: 'Delete Section' });
    const emptySection = createSection({ reportId: report.id, title: 'Empty' });
    const usedSection = createSection({ reportId: report.id, title: 'Used' });
    createPhoto({
      reportId: report.id,
      sectionId: usedSection.id,
      originalPath: '/used.jpg',
    });

    expect(deleteSectionIfEmpty(emptySection.id)).toBe(true);
    expect(deleteSectionIfEmpty(usedSection.id)).toBe(false);
    expect(listSectionsByReportId(report.id).map(s => s.title)).toEqual([
      'Used',
    ]);
  });
});
