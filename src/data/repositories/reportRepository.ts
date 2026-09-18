import { toISODate, toUTCString } from '../../domain/dates';
import type { IReportRepository } from '../../domain/repositories/IReportRepository';
import type {
  CreateReportInput,
  Report,
  UpdateReportInput,
} from '../../domain/models';
import { validateCreateReportInput } from '../../domain/validation/report';
import { generateId } from '../../utils/id';
import { getDatabase } from '../database/database';
import { mapPhotoRow, mapReportRow, mapSectionRow } from '../database/mappers';
import type { DatabaseConnection } from '../database/types';
import { getNextReportNumber } from './reportNumber';

function getDb(db?: DatabaseConnection): DatabaseConnection {
  return db ?? getDatabase();
}

function buildTitle(input: CreateReportInput): string {
  const explicit = input.title?.trim();
  if (explicit) {
    return explicit;
  }
  return input.customerName.trim();
}

export function createReport(
  input: CreateReportInput,
  db?: DatabaseConnection,
): Report {
  const connection = getDb(db);
  const validation = validateCreateReportInput(input);
  if (!validation.valid) {
    const message = Object.values(validation.errors)[0] ?? 'Invalid report input.';
    throw new Error(message);
  }

  const now = toUTCString();
  const report: Report = {
    id: generateId(),
    reportNumber: getNextReportNumber(connection),
    templateKey: input.templateKey ?? 'general',
    title: buildTitle(input),
    customerName: input.customerName.trim(),
    siteAddress: input.siteAddress?.trim() ?? '',
    jobReference: input.jobReference?.trim() ?? '',
    technicianName: input.technicianName?.trim() ?? '',
    reportDate: input.reportDate ?? toISODate(),
    generalNotes: input.generalNotes?.trim() ?? '',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };

  connection.execute(
    `INSERT INTO reports (
      id, report_number, template_key, title, customer_name, site_address,
      job_reference, technician_name, report_date, general_notes,
      status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      report.id,
      report.reportNumber,
      report.templateKey,
      report.title,
      report.customerName,
      report.siteAddress,
      report.jobReference,
      report.technicianName,
      report.reportDate,
      report.generalNotes,
      report.status,
      report.createdAt,
      report.updatedAt,
    ],
  );

  return report;
}

export function getReportById(
  id: string,
  db?: DatabaseConnection,
): Report | null {
  const connection = getDb(db);
  const result = connection.execute('SELECT * FROM reports WHERE id = ? LIMIT 1;', [
    id,
  ]);
  const row = result.rows[0];
  return row ? mapReportRow(row) : null;
}

export function listReports(db?: DatabaseConnection): Report[] {
  const connection = getDb(db);
  const result = connection.execute(
    'SELECT * FROM reports ORDER BY updated_at DESC;',
  );
  return result.rows.map(mapReportRow);
}

export function updateReport(
  id: string,
  input: UpdateReportInput,
  db?: DatabaseConnection,
): Report | null {
  const connection = getDb(db);
  const existing = getReportById(id, connection);
  if (!existing) {
    return null;
  }

  const updated: Report = {
    ...existing,
    templateKey: input.templateKey ?? existing.templateKey,
    title: input.title?.trim() ?? existing.title,
    customerName: input.customerName?.trim() ?? existing.customerName,
    siteAddress: input.siteAddress?.trim() ?? existing.siteAddress,
    jobReference: input.jobReference?.trim() ?? existing.jobReference,
    technicianName: input.technicianName?.trim() ?? existing.technicianName,
    reportDate: input.reportDate ?? existing.reportDate,
    generalNotes: input.generalNotes?.trim() ?? existing.generalNotes,
    status: input.status ?? existing.status,
    updatedAt: toUTCString(),
  };

  connection.execute(
    `UPDATE reports SET
      template_key = ?,
      title = ?,
      customer_name = ?,
      site_address = ?,
      job_reference = ?,
      technician_name = ?,
      report_date = ?,
      general_notes = ?,
      status = ?,
      updated_at = ?
    WHERE id = ?;`,
    [
      updated.templateKey,
      updated.title,
      updated.customerName,
      updated.siteAddress,
      updated.jobReference,
      updated.technicianName,
      updated.reportDate,
      updated.generalNotes,
      updated.status,
      updated.updatedAt,
      id,
    ],
  );

  return updated;
}

export function deleteReport(id: string, db?: DatabaseConnection): boolean {
  const connection = getDb(db);
  const result = connection.execute('DELETE FROM reports WHERE id = ?;', [id]);
  return result.rowsAffected > 0;
}

export function searchReports(
  query: string,
  db?: DatabaseConnection,
): Report[] {
  const connection = getDb(db);
  const trimmed = query.trim();
  if (!trimmed) {
    return listReports(connection);
  }

  const pattern = `%${trimmed}%`;
  const result = connection.execute(
    `SELECT * FROM reports
     WHERE customer_name LIKE ?
        OR title LIKE ?
        OR site_address LIKE ?
        OR job_reference LIKE ?
        OR report_number LIKE ?
        OR technician_name LIKE ?
     ORDER BY updated_at DESC;`,
    [pattern, pattern, pattern, pattern, pattern, pattern],
  );

  return result.rows.map(mapReportRow);
}

export function duplicateReport(
  id: string,
  db?: DatabaseConnection,
): Report | null {
  const connection = getDb(db);
  const source = getReportById(id, connection);
  if (!source) {
    return null;
  }

  return connection.transaction(() => {
    const now = toUTCString();
    const duplicate: Report = {
      ...source,
      id: generateId(),
      reportNumber: getNextReportNumber(connection),
      title: source.title ? `Copy of ${source.title}` : `Copy of ${source.customerName}`,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    connection.execute(
      `INSERT INTO reports (
        id, report_number, template_key, title, customer_name, site_address,
        job_reference, technician_name, report_date, general_notes,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        duplicate.id,
        duplicate.reportNumber,
        duplicate.templateKey,
        duplicate.title,
        duplicate.customerName,
        duplicate.siteAddress,
        duplicate.jobReference,
        duplicate.technicianName,
        duplicate.reportDate,
        duplicate.generalNotes,
        duplicate.status,
        duplicate.createdAt,
        duplicate.updatedAt,
      ],
    );

    const sectionsResult = connection.execute(
      'SELECT * FROM report_sections WHERE report_id = ? ORDER BY sort_order ASC;',
      [id],
    );
    const sectionIdMap = new Map<string, string>();

    for (const row of sectionsResult.rows) {
      const sourceSection = mapSectionRow(row);
      const newSectionId = generateId();
      sectionIdMap.set(sourceSection.id, newSectionId);

      connection.execute(
        `INSERT INTO report_sections (
          id, report_id, title, notes, sort_order, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [
          newSectionId,
          duplicate.id,
          sourceSection.title,
          sourceSection.notes,
          sourceSection.sortOrder,
          now,
          now,
        ],
      );
    }

    const photosResult = connection.execute(
      'SELECT * FROM report_photos WHERE report_id = ? ORDER BY sort_order ASC;',
      [id],
    );

    for (const row of photosResult.rows) {
      const sourcePhoto = mapPhotoRow(row);
      const mappedSectionId = sourcePhoto.sectionId
        ? sectionIdMap.get(sourcePhoto.sectionId) ?? null
        : null;

      connection.execute(
        `INSERT INTO report_photos (
          id, report_id, section_id, original_path, thumbnail_path,
          caption, category, sort_order, captured_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          generateId(),
          duplicate.id,
          mappedSectionId,
          sourcePhoto.originalPath,
          sourcePhoto.thumbnailPath,
          sourcePhoto.caption,
          sourcePhoto.category,
          sourcePhoto.sortOrder,
          sourcePhoto.capturedAt,
          now,
          now,
        ],
      );
    }

    return duplicate;
  });
}

export const reportRepository: IReportRepository = {
  create: input => createReport(input),
  getById: id => getReportById(id),
  list: () => listReports(),
  update: (id, input) => updateReport(id, input),
  delete: id => deleteReport(id),
  search: query => searchReports(query),
  duplicate: id => duplicateReport(id),
};
