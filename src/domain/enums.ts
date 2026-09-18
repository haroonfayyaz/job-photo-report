/** Lifecycle state of a report. */
export type ReportStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export const REPORT_STATUSES: ReportStatus[] = [
  'draft',
  'in_progress',
  'completed',
  'archived',
];

/**
 * Template key identifies the report layout/defaults.
 * Templates may override photo categories in later steps.
 */
export type TemplateKey =
  | 'general'
  | 'inspection'
  | 'maintenance'
  | 'cleaning'
  | 'roofing';

export const TEMPLATE_KEYS: TemplateKey[] = [
  'general',
  'inspection',
  'maintenance',
  'cleaning',
  'roofing',
];

/** Default photo categories; templates may supply alternate sets later. */
export type PhotoCategory =
  | 'BEFORE'
  | 'DURING'
  | 'AFTER'
  | 'ISSUE'
  | 'DEFECT'
  | 'COMPLETED'
  | 'RECOMMENDATION'
  | 'UNCATEGORIZED';

export const DEFAULT_PHOTO_CATEGORIES: PhotoCategory[] = [
  'BEFORE',
  'DURING',
  'AFTER',
  'ISSUE',
  'DEFECT',
  'COMPLETED',
  'RECOMMENDATION',
];
