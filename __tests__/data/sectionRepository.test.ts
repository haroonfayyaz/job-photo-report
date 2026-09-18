import { createReport } from '../../src/data/repositories/reportRepository';
import {
  createSection,
  listSectionsByReportId,
  reorderSections,
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
});
