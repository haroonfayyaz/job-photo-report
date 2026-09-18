import {getDatabase} from '../db/database';
import type {Photo, PhotoCategory} from '../models/types';
import {toISOString} from '../utils/dates';
import {generateId} from '../utils/id';

type PhotoRow = {
  id: string;
  report_id: string;
  section_id: string | null;
  original_path: string;
  thumbnail_path: string | null;
  caption: string;
  category: string;
  sort_order: number;
  captured_at: string;
  annotation_path: string | null;
};

function mapRowToPhoto(row: PhotoRow): Photo {
  return {
    id: row.id,
    reportId: row.report_id,
    sectionId: row.section_id,
    originalPath: row.original_path,
    thumbnailPath: row.thumbnail_path,
    caption: row.caption,
    category: row.category as PhotoCategory,
    sortOrder: row.sort_order,
    capturedAt: row.captured_at,
    annotationPath: row.annotation_path,
  };
}

export function listPhotosByReportId(reportId: string): Photo[] {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM photos
     WHERE report_id = ?
     ORDER BY sort_order ASC, captured_at ASC;`,
    [reportId],
  );

  const rows = (result.rows ?? []) as PhotoRow[];
  return rows.map(mapRowToPhoto);
}

export function listPhotosBySectionId(sectionId: string): Photo[] {
  const db = getDatabase();
  const result = db.executeSync(
    `SELECT * FROM photos
     WHERE section_id = ?
     ORDER BY sort_order ASC, captured_at ASC;`,
    [sectionId],
  );

  const rows = (result.rows ?? []) as PhotoRow[];
  return rows.map(mapRowToPhoto);
}

export interface CreatePhotoInput {
  reportId: string;
  sectionId?: string | null;
  originalPath: string;
  thumbnailPath?: string | null;
  caption?: string;
  category?: PhotoCategory;
  capturedAt?: string;
}

export function createPhoto(input: CreatePhotoInput): Photo {
  const db = getDatabase();
  const sortResult = db.executeSync(
    `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order
     FROM photos WHERE report_id = ?;`,
    [input.reportId],
  );
  const sortOrder = Number(sortResult.rows?.[0]?.next_order ?? 0);

  const photo: Photo = {
    id: generateId(),
    reportId: input.reportId,
    sectionId: input.sectionId ?? null,
    originalPath: input.originalPath,
    thumbnailPath: input.thumbnailPath ?? null,
    caption: input.caption?.trim() ?? '',
    category: input.category ?? 'UNCATEGORIZED',
    sortOrder,
    capturedAt: input.capturedAt ?? toISOString(),
    annotationPath: null,
  };

  db.executeSync(
    `INSERT INTO photos (
      id, report_id, section_id, original_path, thumbnail_path,
      caption, category, sort_order, captured_at, annotation_path
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
      photo.annotationPath,
    ],
  );

  return photo;
}

export function updatePhoto(
  id: string,
  updates: {
    sectionId?: string | null;
    caption?: string;
    category?: PhotoCategory;
    sortOrder?: number;
  },
): Photo | null {
  const db = getDatabase();
  const existingResult = db.executeSync(
    'SELECT * FROM photos WHERE id = ? LIMIT 1;',
    [id],
  );
  const existing = existingResult.rows?.[0] as PhotoRow | undefined;
  if (!existing) {
    return null;
  }

  const photo: Photo = {
    id: existing.id,
    reportId: existing.report_id,
    sectionId:
      updates.sectionId !== undefined ? updates.sectionId : existing.section_id,
    originalPath: existing.original_path,
    thumbnailPath: existing.thumbnail_path,
    caption: updates.caption?.trim() ?? existing.caption,
    category: (updates.category ?? existing.category) as PhotoCategory,
    sortOrder: updates.sortOrder ?? existing.sort_order,
    capturedAt: existing.captured_at,
    annotationPath: existing.annotation_path,
  };

  db.executeSync(
    `UPDATE photos SET
      section_id = ?,
      caption = ?,
      category = ?,
      sort_order = ?
    WHERE id = ?;`,
    [photo.sectionId, photo.caption, photo.category, photo.sortOrder, id],
  );

  return photo;
}

export function deletePhoto(id: string): boolean {
  const db = getDatabase();
  const result = db.executeSync('DELETE FROM photos WHERE id = ?;', [id]);
  return (result.rowsAffected ?? 0) > 0;
}
