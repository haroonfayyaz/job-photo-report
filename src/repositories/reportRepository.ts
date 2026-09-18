import {getDatabase} from '../db/database';
import type {
  CreateReportInput,
  Report,
  ReportListItem,
  ReportStatus,
  ReportType,
  UpdateReportInput,
} from '../models/types';
import {
  buildReportNumber,
  formatReportNumberPrefix,
  parseReportNumberSequence,
} from '../services/reportNumberService';
import {toISOString, toISODate} from '../utils/dates';
import {generateId} from '../utils/id';

type ReportRow = {
  id: string;
  report_number: string;
  report_type: string;
  customer_name: string;
  address: string;
  reference_number: string;
  technician_name: string;
  report_date: string;
  general_notes: string;
  status: string;
  signature_path: string | null;
  created_at: string;
  updated_at: string;
};

function mapRowToReport(row: ReportRow): Report {
  return {
    id: row.id,
    reportNumber: row.report_number,
    reportType: row.report_type as ReportType,
    customerName: row.customer_name,
    address: row.address,
    referenceNumber: row.reference_number,
    technicianName: row.technician_name,
    reportDate: row.report_date,
    generalNotes: row.general_notes,
    status: row.status as ReportStatus,
    signaturePath: row.signature_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getNextReportSequence(prefix: string): number {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT report_number FROM reports
     WHERE report_number LIKE ?
     ORDER BY report_number DESC
     LIMIT 1;`,
    [`${prefix}-%`],
  );

  const latestNumber = result.rows?.[0]?.report_number as string | undefined;
  if (!latestNumber) {
    return 1;
  }

  const sequence = parseReportNumberSequence(latestNumber);
  return sequence ? sequence + 1 : 1;
}

export function createReport(input: CreateReportInput): Report {
  const db = getDatabase();
  const now = toISOString();
  const id = generateId();
  const prefix = formatReportNumberPrefix();
  const sequence = getNextReportSequence(prefix);
  const reportNumber = buildReportNumber(prefix, sequence);

  const report: Report = {
    id,
    reportNumber,
    reportType: input.reportType ?? 'general',
    customerName: input.customerName.trim(),
    address: input.address?.trim() ?? '',
    referenceNumber: input.referenceNumber?.trim() ?? '',
    technicianName: input.technicianName?.trim() ?? '',
    reportDate: input.reportDate ?? toISODate(),
    generalNotes: input.generalNotes?.trim() ?? '',
    status: 'draft',
    signaturePath: null,
    createdAt: now,
    updatedAt: now,
  };

  db.executeSync(
    `INSERT INTO reports (
      id, report_number, report_type, customer_name, address,
      reference_number, technician_name, report_date, general_notes,
      status, signature_path, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      report.id,
      report.reportNumber,
      report.reportType,
      report.customerName,
      report.address,
      report.referenceNumber,
      report.technicianName,
      report.reportDate,
      report.generalNotes,
      report.status,
      report.signaturePath,
      report.createdAt,
      report.updatedAt,
    ],
  );

  return report;
}

export function getReportById(id: string): Report | null {
  const db = getDatabase();
  const result = db.executeSync('SELECT * FROM reports WHERE id = ? LIMIT 1;', [
    id,
  ]);

  const row = result.rows?.[0] as ReportRow | undefined;
  return row ? mapRowToReport(row) : null;
}

export function listReports(): ReportListItem[] {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT
      r.*,
      (SELECT COUNT(*) FROM photos p WHERE p.report_id = r.id) AS photo_count,
      (SELECT COUNT(*) FROM report_sections s WHERE s.report_id = r.id) AS section_count
    FROM reports r
    WHERE r.status != 'archived'
    ORDER BY r.updated_at DESC;`,
  );

  const rows = (result.rows ?? []) as Array<
    ReportRow & {photo_count: number; section_count: number}
  >;

  return rows.map(row => ({
    ...mapRowToReport(row),
    photoCount: Number(row.photo_count ?? 0),
    sectionCount: Number(row.section_count ?? 0),
  }));
}

export function updateReport(
  id: string,
  input: UpdateReportInput,
): Report | null {
  const existing = getReportById(id);
  if (!existing) {
    return null;
  }

  const updated: Report = {
    ...existing,
    reportType: input.reportType ?? existing.reportType,
    customerName: input.customerName?.trim() ?? existing.customerName,
    address: input.address?.trim() ?? existing.address,
    referenceNumber: input.referenceNumber?.trim() ?? existing.referenceNumber,
    technicianName: input.technicianName?.trim() ?? existing.technicianName,
    reportDate: input.reportDate ?? existing.reportDate,
    generalNotes: input.generalNotes?.trim() ?? existing.generalNotes,
    status: input.status ?? existing.status,
    signaturePath:
      input.signaturePath !== undefined
        ? input.signaturePath
        : existing.signaturePath,
    updatedAt: toISOString(),
  };

  const db = getDatabase();
  db.executeSync(
    `UPDATE reports SET
      report_type = ?,
      customer_name = ?,
      address = ?,
      reference_number = ?,
      technician_name = ?,
      report_date = ?,
      general_notes = ?,
      status = ?,
      signature_path = ?,
      updated_at = ?
    WHERE id = ?;`,
    [
      updated.reportType,
      updated.customerName,
      updated.address,
      updated.referenceNumber,
      updated.technicianName,
      updated.reportDate,
      updated.generalNotes,
      updated.status,
      updated.signaturePath,
      updated.updatedAt,
      id,
    ],
  );

  return updated;
}

export function deleteReport(id: string): boolean {
  const db = getDatabase();
  const result = db.executeSync('DELETE FROM reports WHERE id = ?;', [id]);
  return (result.rowsAffected ?? 0) > 0;
}
