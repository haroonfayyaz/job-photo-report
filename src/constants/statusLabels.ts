import type { ReportStatus } from '../domain/enums';

export const STATUS_LABELS: Record<ReportStatus, string> = {
  draft: 'Draft',
  in_progress: 'In Progress',
  completed: 'Completed',
  archived: 'Archived',
};
