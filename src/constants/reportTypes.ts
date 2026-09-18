import type {ReportType} from '../models/types';

export const REPORT_TYPES: ReportType[] = [
  'general',
  'inspection',
  'maintenance',
  'cleaning',
  'roofing',
];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  general: 'General Report',
  inspection: 'Inspection',
  maintenance: 'Maintenance',
  cleaning: 'Cleaning',
  roofing: 'Roofing',
};
