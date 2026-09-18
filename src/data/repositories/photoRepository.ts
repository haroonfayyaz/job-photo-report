import { toUTCString } from '../../domain/dates';
import type { IPhotoRepository } from '../../domain/repositories/IPhotoRepository';
import type {
  CreatePhotoInput,
  ReportPhoto,
  UpdatePhotoInput,
} from '../../domain/models';
import { generateId } from '../../utils/id';
import { getDatabase } from '../database/database';
import { mapPhotoRow } from '../database/mappers';
import type { DatabaseConnection } from '../database/types';

function getDb(db?: DatabaseConnection): DatabaseConnection {
  return db ?? getDatabase();
}

function getNextSortOrder(reportId: string, db: DatabaseConnection): number {
  const result = db.execute(
    `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order
     FROM report_photos WHERE report_id = ?;`,
    [reportId],
  );
  return Number(result.rows[0]?.next_order ?? 0);
}

export function createPhoto(
  input: CreatePhotoInput,
  db?: DatabaseConnection,
): ReportPhoto {
  const connection = getDb(db);
  const now = toUTCString();
  const photo: ReportPhoto = {
    id: generateId(),
    reportId: input.reportId,
    sectionId: input.sectionId ?? null,
    originalPath: input.originalPath,
    thumbnailPath: input.thumbnailPath ?? null,
    caption: input.caption?.trim() ?? '',
    category: input.category ?? 'UNCATEGORIZED',
    sortOrder: input.sortOrder ?? getNextSortOrder(input.reportId, connection),
    capturedAt: input.capturedAt ?? now,
    createdAt: now,
    updatedAt: now,
  };

  connection.execute(
    `INSERT INTO report_photos (
      id, report_id, section_id, original_path, thumbnail_path,
      caption, category, sort_order, captured_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      photo.id,
      photo.reportId,
      photo.sectionId,
      photo.originalPath,
      photo.thumbnailPath,
      photo.caption,
      photo.category,
      photo.sortOrder,
      photo.capturedAt,
      photo.createdAt,
      photo.updatedAt,
    ],
  );

  return photo;
}

export function getPhotoById(
  id: string,
  db?: DatabaseConnection,
): ReportPhoto | null {
  const connection = getDb(db);
  const result = connection.execute(
    'SELECT * FROM report_photos WHERE id = ? LIMIT 1;',
    [id],
  );
  const row = result.rows[0];
  return row ? mapPhotoRow(row) : null;
}

export function listPhotosByReportId(
  reportId: string,
  db?: DatabaseConnection,
): ReportPhoto[] {
  const connection = getDb(db);
  const result = connection.execute(
    `SELECT * FROM report_photos
     WHERE report_id = ?
     ORDER BY sort_order ASC, captured_at ASC;`,
    [reportId],
  );
  return result.rows.map(mapPhotoRow);
}

export function listPhotosBySectionId(
  sectionId: string,
  db?: DatabaseConnection,
): ReportPhoto[] {
  const connection = getDb(db);
  const result = connection.execute(
    `SELECT * FROM report_photos
     WHERE section_id = ?
     ORDER BY sort_order ASC, captured_at ASC;`,
    [sectionId],
  );
  return result.rows.map(mapPhotoRow);
}

export function updatePhoto(
  id: string,
  input: UpdatePhotoInput,
  db?: DatabaseConnection,
): ReportPhoto | null {
  const connection = getDb(db);
  const existing = getPhotoById(id, connection);
  if (!existing) {
    return null;
  }

  const updated: ReportPhoto = {
    ...existing,
    sectionId:
      input.sectionId !== undefined ? input.sectionId : existing.sectionId,
    caption: input.caption?.trim() ?? existing.caption,
    category: input.category ?? existing.category,
    sortOrder: input.sortOrder ?? existing.sortOrder,
    updatedAt: toUTCString(),
  };

  connection.execute(
    `UPDATE report_photos SET
      section_id = ?,
      caption = ?,
      category = ?,
      sort_order = ?,
      updated_at = ?
    WHERE id = ?;`,
    [
      updated.sectionId,
      updated.caption,
      updated.category,
      updated.sortOrder,
      updated.updatedAt,
      id,
    ],
  );

  return updated;
}

export function deletePhoto(id: string, db?: DatabaseConnection): boolean {
  const connection = getDb(db);
  const result = connection.execute('DELETE FROM report_photos WHERE id = ?;', [
    id,
  ]);
  return result.rowsAffected > 0;
}

export function reorderPhotos(
  reportId: string,
  orderedPhotoIds: string[],
  db?: DatabaseConnection,
): ReportPhoto[] {
  const connection = getDb(db);

  connection.transaction(() => {
    orderedPhotoIds.forEach((photoId, index) => {
      connection.execute(
        `UPDATE report_photos SET sort_order = ?, updated_at = ?
         WHERE id = ? AND report_id = ?;`,
        [index, toUTCString(), photoId, reportId],
      );
    });
  });

  return listPhotosByReportId(reportId, connection);
}

export const photoRepository: IPhotoRepository = {
  create: input => createPhoto(input),
  getById: id => getPhotoById(id),
  listByReportId: reportId => listPhotosByReportId(reportId),
  listBySectionId: sectionId => listPhotosBySectionId(sectionId),
  update: (id, input) => updatePhoto(id, input),
  delete: id => deletePhoto(id),
  reorder: (reportId, orderedPhotoIds) =>
    reorderPhotos(reportId, orderedPhotoIds),
};
