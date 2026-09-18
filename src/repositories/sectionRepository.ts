import {getDatabase} from '../db/database';
import type {ReportSection} from '../models/types';
import {generateId} from '../utils/id';

type SectionRow = {
  id: string;
  report_id: string;
  title: string;
  notes: string;
  sort_order: number;
};

function mapRowToSection(row: SectionRow): ReportSection {
  return {
    id: row.id,
    reportId: row.report_id,
    title: row.title,
    notes: row.notes,
    sortOrder: row.sort_order,
  };
}

export function listSectionsByReportId(reportId: string): ReportSection[] {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM report_sections
     WHERE report_id = ?
     ORDER BY sort_order ASC, title ASC;`,
    [reportId],
  );

  const rows = (result.rows ?? []) as SectionRow[];
  return rows.map(mapRowToSection);
}

export function createSection(
  reportId: string,
  title: string,
  notes = '',
): ReportSection {
  const db = getDatabase();
  const sortResult = db.executeSync(
    `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order
     FROM report_sections WHERE report_id = ?;`,
    [reportId],
  );
  const sortOrder = Number(sortResult.rows?.[0]?.next_order ?? 0);

  const section: ReportSection = {
    id: generateId(),
    reportId,
    title: title.trim(),
    notes: notes.trim(),
    sortOrder,
  };

  db.executeSync(
    `INSERT INTO report_sections (id, report_id, title, notes, sort_order)
     VALUES (?, ?, ?, ?, ?);`,
    [section.id, section.reportId, section.title, section.notes, section.sortOrder],
  );

  return section;
}

export function updateSection(
  id: string,
  updates: {title?: string; notes?: string; sortOrder?: number},
): ReportSection | null {
  const db = getDatabase();
  const existingResult = db.executeSync(
    'SELECT * FROM report_sections WHERE id = ? LIMIT 1;',
    [id],
  );
  const existing = existingResult.rows?.[0] as SectionRow | undefined;
  if (!existing) {
    return null;
  }

  const section: ReportSection = {
    id: existing.id,
    reportId: existing.report_id,
    title: updates.title?.trim() ?? existing.title,
    notes: updates.notes?.trim() ?? existing.notes,
    sortOrder: updates.sortOrder ?? existing.sort_order,
  };

  db.executeSync(
    `UPDATE report_sections SET title = ?, notes = ?, sort_order = ?
     WHERE id = ?;`,
    [section.title, section.notes, section.sortOrder, id],
  );

  return section;
}

export function deleteSection(id: string): boolean {
  const db = getDatabase();
  const result = db.executeSync('DELETE FROM report_sections WHERE id = ?;', [id]);
  return (result.rowsAffected ?? 0) > 0;
}
