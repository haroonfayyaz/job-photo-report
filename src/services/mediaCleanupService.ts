import RNFS from 'react-native-fs';

import { localFileService } from '../data/services/localFileService';
import {
  getReportsRoot,
  getReportDir,
  isOwnedAppPath,
} from '../data/services/mediaPaths';
import {
  deletePhoto,
  getPhotoById,
  listPhotosByReportId,
} from '../data/repositories/photoRepository';
import {
  deleteReport,
  getReportById,
  listReports,
} from '../data/repositories/reportRepository';
import { getSignatureByReportId } from '../data/repositories/signatureRepository';

async function safeDeleteOwnedFile(path: string | null | undefined): Promise<void> {
  if (!path || !isOwnedAppPath(RNFS.DocumentDirectoryPath, path)) {
    return;
  }

  await localFileService.deleteFile(path);
}

export async function deletePhotoWithMedia(photoId: string): Promise<boolean> {
  const photo = getPhotoById(photoId);
  if (!photo) {
    return false;
  }

  await safeDeleteOwnedFile(photo.originalPath);
  await safeDeleteOwnedFile(photo.thumbnailPath);

  return deletePhoto(photoId);
}

export async function deleteReportWithMedia(reportId: string): Promise<boolean> {
  const report = getReportById(reportId);
  if (!report) {
    return false;
  }

  const photos = listPhotosByReportId(reportId);
  for (const photo of photos) {
    await safeDeleteOwnedFile(photo.originalPath);
    await safeDeleteOwnedFile(photo.thumbnailPath);
  }

  const signature = getSignatureByReportId(reportId);
  if (signature) {
    await safeDeleteOwnedFile(signature.localPath);
  }

  await localFileService.deleteReportMedia(reportId);

  return deleteReport(reportId);
}

export async function cleanupOrphanedTempFiles(): Promise<number> {
  const tempFiles = await localFileService.listTempFiles();
  let removed = 0;

  for (const fileName of tempFiles) {
    try {
      await localFileService.deleteTempFile(fileName);
      removed += 1;
    } catch (error) {
      console.warn('Failed to remove temp file:', fileName, error);
    }
  }

  return removed;
}

export async function cleanupUnreferencedReportDirectories(): Promise<number> {
  const reportsRoot = getReportsRoot(RNFS.DocumentDirectoryPath);
  if (!(await RNFS.exists(reportsRoot))) {
    return 0;
  }

  const knownReportIds = new Set(listReports().map(report => report.id));
  let removed = 0;

  try {
    const entries = await RNFS.readDir(reportsRoot);
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const reportId = entry.name;
      const reportDir = getReportDir(RNFS.DocumentDirectoryPath, reportId);
      if (!isOwnedAppPath(RNFS.DocumentDirectoryPath, reportDir)) {
        continue;
      }

      if (!knownReportIds.has(reportId)) {
        await localFileService.deleteReportMedia(reportId);
        removed += 1;
      }
    }
  } catch (error) {
    console.warn('Failed to scan report directories for orphans:', error);
  }

  return removed;
}

export async function runOrphanCleanup(): Promise<{
  tempFilesRemoved: number;
  reportDirsRemoved: number;
}> {
  const tempFilesRemoved = await cleanupOrphanedTempFiles();
  const reportDirsRemoved = await cleanupUnreferencedReportDirectories();

  return { tempFilesRemoved, reportDirsRemoved };
}
