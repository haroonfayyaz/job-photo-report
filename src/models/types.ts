export type ReportStatus = 'draft' | 'in_progress' | 'completed' | 'archived';

export type ReportType = 'general' | 'inspection' | 'maintenance' | 'cleaning' | 'roofing';

export type PhotoCategory =
  | 'BEFORE'
  | 'DURING'
  | 'AFTER'
  | 'ISSUE'
  | 'DEFECT'
  | 'COMPLETED'
  | 'RECOMMENDATION'
  | 'UNCATEGORIZED';

export interface Report {
  id: string;
  reportNumber: string;
  reportType: ReportType;
  customerName: string;
  address: string;
  referenceNumber: string;
  technicianName: string;
  reportDate: string;
  generalNotes: string;
  status: ReportStatus;
  signaturePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSection {
  id: string;
  reportId: string;
  title: string;
  notes: string;
  sortOrder: number;
}

export interface Photo {
  id: string;
  reportId: string;
  sectionId: string | null;
  originalPath: string;
  thumbnailPath: string | null;
  caption: string;
  category: PhotoCategory;
  sortOrder: number;
  capturedAt: string;
  annotationPath: string | null;
}

export interface BusinessProfile {
  companyName: string;
  logoPath: string | null;
  phone: string;
  email: string;
  website: string;
  address: string;
  defaultTechnicianName: string;
}

export interface CreateReportInput {
  reportType?: ReportType;
  customerName: string;
  address?: string;
  referenceNumber?: string;
  technicianName?: string;
  reportDate?: string;
  generalNotes?: string;
}

export interface UpdateReportInput {
  reportType?: ReportType;
  customerName?: string;
  address?: string;
  referenceNumber?: string;
  technicianName?: string;
  reportDate?: string;
  generalNotes?: string;
  status?: ReportStatus;
  signaturePath?: string | null;
}

export interface ReportListItem extends Report {
  photoCount: number;
  sectionCount: number;
}
