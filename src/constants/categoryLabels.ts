import type { PhotoCategory } from '../domain/enums';
import { DEFAULT_PHOTO_CATEGORIES } from '../domain/enums';

export const CATEGORY_LABELS: Record<PhotoCategory, string> = {
  BEFORE: 'Before',
  DURING: 'During',
  AFTER: 'After',
  ISSUE: 'Issue',
  DEFECT: 'Defect',
  COMPLETED: 'Completed',
  RECOMMENDATION: 'Recommendation',
  UNCATEGORIZED: 'Uncategorized',
};

export const FAST_CATEGORY_OPTIONS = DEFAULT_PHOTO_CATEGORIES;
