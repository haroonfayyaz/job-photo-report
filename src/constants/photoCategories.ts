import type {PhotoCategory} from '../models/types';

/** Default categories; templates may override these later. */
export const DEFAULT_PHOTO_CATEGORIES: PhotoCategory[] = [
  'BEFORE',
  'DURING',
  'AFTER',
  'ISSUE',
  'DEFECT',
  'COMPLETED',
  'RECOMMENDATION',
];

export const PHOTO_CATEGORY_LABELS: Record<PhotoCategory, string> = {
  BEFORE: 'Before',
  DURING: 'During',
  AFTER: 'After',
  ISSUE: 'Issue',
  DEFECT: 'Defect',
  COMPLETED: 'Completed',
  RECOMMENDATION: 'Recommendation',
  UNCATEGORIZED: 'Uncategorized',
};
