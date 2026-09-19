import { createPhoto } from '../../src/data/repositories/photoRepository';
import { createReport } from '../../src/data/repositories/reportRepository';
import { createSection } from '../../src/data/repositories/sectionRepository';
import {
  flattenPhotoIds,
  getUncategorizedPhotoIds,
  groupPhotosBySection,
  UNASSIGNED_SECTION_TITLE,
} from '../../src/utils/groupPhotosBySection';
import {
  createTestDatabase,
  destroyTestDatabase,
} from '../helpers/sqlJsConnection';

describe('groupPhotosBySection', () => {
  beforeEach(async () => {
    await createTestDatabase();
  });

  afterEach(async () => {
    await destroyTestDatabase();
  });

  it('groups unassigned photos under an Unassigned section', () => {
    const report = createReport({ customerName: 'Group Test' });
    const section = createSection({ reportId: report.id, title: 'Kitchen' });
    const unassigned = createPhoto({
      reportId: report.id,
      originalPath: '/a.jpg',
    });
    const assigned = createPhoto({
      reportId: report.id,
      sectionId: section.id,
      originalPath: '/b.jpg',
    });

    const groups = groupPhotosBySection(
      [section],
      [unassigned, assigned],
    );

    expect(groups).toHaveLength(2);
    expect(groups[0].title).toBe(UNASSIGNED_SECTION_TITLE);
    expect(groups[0].photos).toHaveLength(1);
    expect(groups[1].title).toBe('Kitchen');
    expect(flattenPhotoIds(groups)).toEqual([unassigned.id, assigned.id]);
  });

  it('returns uncategorized photo ids for fast workflow', () => {
    const report = createReport({ customerName: 'Fast Flow' });
    const uncategorized = createPhoto({
      reportId: report.id,
      originalPath: '/a.jpg',
      category: 'UNCATEGORIZED',
    });
    const categorized = createPhoto({
      reportId: report.id,
      originalPath: '/b.jpg',
      category: 'BEFORE',
    });

    expect(
      getUncategorizedPhotoIds([uncategorized, categorized]),
    ).toEqual([uncategorized.id]);
  });
});
