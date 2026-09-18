import type {
  BusinessProfile,
  Report,
  ReportPhoto,
  ReportSection,
  Signature,
} from '../../domain/models';
import type { PhotoCategory, ReportStatus, TemplateKey } from '../../domain/enums';
import type { SqlValue } from './types';

function str(value: SqlValue | undefined, fallback = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value);
}

function nullableStr(value: SqlValue | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return String(value);
}

function num(value: SqlValue | undefined, fallback = 0): number {
  if (value === null || value === undefined) {
    return fallback;
  }
  return Number(value);
}

export function mapReportRow(row: Record<string, SqlValue>): Report {
  return {
    id: str(row.id),
    reportNumber: str(row.report_number),
    templateKey: str(row.template_key, 'general') as TemplateKey,
    title: str(row.title),
    customerName: str(row.customer_name),
    siteAddress: str(row.site_address),
    jobReference: str(row.job_reference),
    technicianName: str(row.technician_name),
    reportDate: str(row.report_date),
    generalNotes: str(row.general_notes),
    status: str(row.status, 'draft') as ReportStatus,
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapSectionRow(row: Record<string, SqlValue>): ReportSection {
  return {
    id: str(row.id),
    reportId: str(row.report_id),
    title: str(row.title),
    notes: str(row.notes),
    sortOrder: num(row.sort_order),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapPhotoRow(row: Record<string, SqlValue>): ReportPhoto {
  return {
    id: str(row.id),
    reportId: str(row.report_id),
    sectionId: nullableStr(row.section_id),
    originalPath: str(row.original_path),
    thumbnailPath: nullableStr(row.thumbnail_path),
    caption: str(row.caption),
    category: str(row.category, 'UNCATEGORIZED') as PhotoCategory,
    sortOrder: num(row.sort_order),
    capturedAt: str(row.captured_at),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export function mapSignatureRow(row: Record<string, SqlValue>): Signature {
  return {
    id: str(row.id),
    reportId: str(row.report_id),
    signerName: str(row.signer_name),
    localPath: str(row.local_path),
    signedAt: str(row.signed_at),
  };
}

export function mapBusinessProfileRow(
  row: Record<string, SqlValue>,
): BusinessProfile {
  return {
    companyName: str(row.company_name),
    logoPath: nullableStr(row.logo_path),
    phone: str(row.phone),
    email: str(row.email),
    website: str(row.website),
    address: str(row.address),
    defaultTechnicianName: str(row.default_technician_name),
  };
}
