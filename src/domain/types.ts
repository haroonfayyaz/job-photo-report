/** Core domain types — expanded in later steps. */
export type ReportStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export type ReportType =
  | 'general'
  | 'inspection'
  | 'maintenance'
  | 'cleaning'
  | 'roofing';
