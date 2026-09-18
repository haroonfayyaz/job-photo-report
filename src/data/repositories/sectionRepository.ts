import { toUTCString } from '../../domain/dates';
import type { ISectionRepository } from '../../domain/repositories/ISectionRepository';
import type {
  CreateSectionInput,
  ReportSection,
  UpdateSectionInput,
} from '../../domain/models';
import { generateId } from '../../utils/id';
import { getDatabase } from '../database/database';
import { mapSectionRow } from '../database/mappers';
import type { DatabaseConnection } from '../database/types';

function getDb(db?: DatabaseConnection): DatabaseConnection {
  return db ?? getDatabase();
}

function getNextSortOrder(reportId: string, db: DatabaseConnection): number {
  const result = db.execute(
    `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order
     FROM report_sections WHERE report_id = ?;`,
    [reportId],
  );
  return Number(result.rows[0]?.next_order ?? 0);
}

export function createSection(
  input: CreateSectionInput,
  db?: DatabaseConnection,
): ReportSection {
  const connection = getDb(db);
  const now = toUTCString();
  const section: ReportSection = {
    id: generateId(),
    reportId: input.reportId,
    title: input.title.trim(),
    notes: input.notes?.trim() ?? '',
    sortOrder:
      input.sortOrder ?? getNextSortOrder(input.reportId, connection),
    createdAt: now,
    updatedAt: now,
  };

  connection.execute(
    `INSERT INTO report_sections (
      id, report_id, title, notes, sort_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      section.id,
      section.reportId,
      section.title,
      section.notes,
      section.sortOrder,
      section.createdAt,
      section.updatedAt,
    ],
  );

  return section;
}

export function getSectionById(
  id: string,
  db?: DatabaseConnection,
): ReportSection | null {
  const connection = getDb(db);
  const result = connection.execute(
    'SELECT * FROM report_sections WHERE id = ? LIMIT 1;',
    [id],
  );
  const row = result.rows[0];
  return row ? mapSectionRow(row) : null;
}

export function listSectionsByReportId(
  reportId: string,
  db?: DatabaseConnection,
): ReportSection[] {
  const connection = getDb(db);
  const result = connection.execute(
    `SELECT * FROM report_sections
     WHERE report_id = ?
     ORDER BY sort_order ASC, title ASC;`,
    [reportId],
  );
  return result.rows.map(mapSectionRow);
}

export function updateSection(
  id: string,
  input: UpdateSectionInput,
  db?: DatabaseConnection,
): ReportSection | null {
  const connection = getDb(db);
  const existing = getSectionById(id, connection);
  if (!existing) {
    return null;
  }

  const updated: ReportSection = {
    ...existing,
    title: input.title?.trim() ?? existing.title,
    notes: input.notes?.trim() ?? existing.notes,
    sortOrder: input.sortOrder ?? existing.sortOrder,
    updatedAt: toUTCString(),
  };

  connection.execute(
    `UPDATE report_sections SET
      title = ?,
      notes = ?,
      sort_order = ?,
      updated_at = ?
    WHERE id = ?;`,
    [
      updated.title,
      updated.notes,
      updated.sortOrder,
      updated.updatedAt,
      id,
    ],
  );

  return updated;
}

export function deleteSection(id: string, db?: DatabaseConnection): boolean {
  const connection = getDb(db);
  const result = connection.execute('DELETE FROM report_sections WHERE id = ?;', [
    id,
  ]);
  return result.rowsAffected > 0;
}

export function reorderSections(
  reportId: string,
  orderedSectionIds: string[],
  db?: DatabaseConnection,
): ReportSection[] {
  const connection = getDb(db);

  connection.transaction(() => {
    orderedSectionIds.forEach((sectionId, index) => {
      connection.execute(
        `UPDATE report_sections SET sort_order = ?, updated_at = ?
         WHERE id = ? AND report_id = ?;`,
        [index, toUTCString(), sectionId, reportId],
      );
    });
  });

  return listSectionsByReportId(reportId, connection);
}

export const sectionRepository: ISectionRepository = {
  create: input => createSection(input),
  getById: id => getSectionById(id),
  listByReportId: reportId => listSectionsByReportId(reportId),
  update: (id, input) => updateSection(id, input),
  delete: id => deleteSection(id),
  reorder: (reportId, orderedSectionIds) =>
    reorderSections(reportId, orderedSectionIds),
};
