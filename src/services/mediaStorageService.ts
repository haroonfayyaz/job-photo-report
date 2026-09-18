import { localFileService } from '../data/services/localFileService';
import {
  buildOriginalPhotoFileName,
  buildThumbnailPhotoFileName,
  MIN_FREE_BYTES_FOR_IMPORT,
} from '../data/services/mediaPaths';
import {
  createPhoto,
  updatePhoto,
} from '../data/repositories/photoRepository';
import { toUTCString } from '../domain/dates';
import { isMediaStorageError } from '../domain/errors/mediaStorageError';
import type { ReportPhoto } from '../domain/models';

export interface SaveImportedPhotoInput {
  reportId: string;
  photoId: string;
  sourceUri: string;
  extension: string;
  capturedAt?: string;
}

async function cleanupPartialPhotoFiles(
  originalPath: string | null,
  thumbnailPath: string | null,
): Promise<void> {
  if (originalPath) {
    await localFileService.deleteFile(originalPath);
  }
  if (thumbnailPath) {
    await localFileService.deleteFile(thumbnailPath);
  }
}

export async function saveImportedPhoto(
  input: SaveImportedPhotoInput,
): Promise<ReportPhoto> {
  await localFileService.assertAvailableStorage(MIN_FREE_BYTES_FOR_IMPORT);

  let originalPath: string | null = null;
  let thumbnailPath: string | null = null;

  try {
    const original = await localFileService.savePhoto(
      input.reportId,
      input.sourceUri,
      buildOriginalPhotoFileName(input.photoId, input.extension),
    );
    originalPath = original.path;

    try {
      const thumbnail = await localFileService.generateThumbnail(
        input.reportId,
        original.path,
        buildThumbnailPhotoFileName(input.photoId),
      );
      thumbnailPath = thumbnail.path;
    } catch (thumbnailError) {
      console.warn(
        'Thumbnail generation failed; photo saved without thumbnail.',
        thumbnailError,
      );
    }

    return createPhoto({
      id: input.photoId,
      reportId: input.reportId,
      originalPath: original.path,
      thumbnailPath,
      capturedAt: input.capturedAt ?? toUTCString(),
    });
  } catch (error) {
    await cleanupPartialPhotoFiles(originalPath, thumbnailPath);

    if (isMediaStorageError(error)) {
      throw error;
    }

    throw error;
  }
}

async function createThumbnailForPhoto(photo: ReportPhoto): Promise<string | null> {
  try {
    const thumbnail = await localFileService.generateThumbnail(
      photo.reportId,
      photo.originalPath,
      buildThumbnailPhotoFileName(photo.id),
    );
    return thumbnail.path;
  } catch (error) {
    console.warn('Thumbnail generation failed for photo:', photo.id, error);
    return null;
  }
}

export async function ensurePhotoThumbnail(
  photo: ReportPhoto,
): Promise<ReportPhoto> {
  if (photo.thumbnailPath && (await localFileService.fileExists(photo.thumbnailPath))) {
    return photo;
  }

  if (!(await localFileService.fileExists(photo.originalPath))) {
    return photo;
  }

  const thumbnailPath = await createThumbnailForPhoto(photo);
  if (!thumbnailPath) {
    return photo;
  }

  const updated = updatePhoto(photo.id, { thumbnailPath });
  return updated ?? { ...photo, thumbnailPath };
}

export async function ensureReportPhotoThumbnails(
  photos: ReportPhoto[],
): Promise<ReportPhoto[]> {
  const updatedPhotos: ReportPhoto[] = [];

  for (const photo of photos) {
    if (photo.thumbnailPath && (await localFileService.fileExists(photo.thumbnailPath))) {
      updatedPhotos.push(photo);
      continue;
    }

    updatedPhotos.push(await ensurePhotoThumbnail(photo));
  }

  return updatedPhotos;
}
