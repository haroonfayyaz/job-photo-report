import type {ReportStatus} from '../models/types';

export const REPORT_STATUSES: ReportStatus[] = [
  'draft',
  'in_progress',
  'completed',
  'archived',
];

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
};
