import type { PhotoCategory, ReportStatus, TemplateKey } from './enums';

/**
 * Internal date/time convention: ISO 8601 UTC strings.
 * - reportDate: calendar date only, `YYYY-MM-DD`
 * - createdAt, updatedAt, capturedAt, signedAt: full UTC timestamps
 *
 * @see src/domain/dates.ts
 */
export interface Report {
  id: string;
  reportNumber: string;
  templateKey: TemplateKey;
  title: string;
  customerName: string;
  siteAddress: string;
  jobReference: string;
  technicianName: string;
  reportDate: string;
  generalNotes: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReportSection {
  id: string;
  reportId: string;
  title: string;
  notes: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportPhoto {
  id: string;
  reportId: string;
  sectionId: string | null;
  originalPath: string;
  thumbnailPath: string | null;
  caption: string;
  category: PhotoCategory;
  sortOrder: number;
  capturedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Signature {
  id: string;
  reportId: string;
  signerName: string;
  localPath: string;
  signedAt: string;
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
  templateKey?: TemplateKey;
  title?: string;
  customerName: string;
  siteAddress?: string;
  jobReference?: string;
  technicianName?: string;
  reportDate?: string;
  generalNotes?: string;
}

export interface UpdateReportInput {
  templateKey?: TemplateKey;
  title?: string;
  customerName?: string;
  siteAddress?: string;
  jobReference?: string;
  technicianName?: string;
  reportDate?: string;
  generalNotes?: string;
  status?: ReportStatus;
}

export interface CreateSectionInput {
  reportId: string;
  title: string;
  notes?: string;
  sortOrder?: number;
}

export interface UpdateSectionInput {
  title?: string;
  notes?: string;
  sortOrder?: number;
}

export interface CreatePhotoInput {
  reportId: string;
  sectionId?: string | null;
  originalPath: string;
  thumbnailPath?: string | null;
  caption?: string;
  category?: PhotoCategory;
  sortOrder?: number;
  capturedAt?: string;
}

export interface UpdatePhotoInput {
  sectionId?: string | null;
  caption?: string;
  category?: PhotoCategory;
  sortOrder?: number;
}

export interface CreateSignatureInput {
  reportId: string;
  signerName: string;
  localPath: string;
  signedAt?: string;
}
