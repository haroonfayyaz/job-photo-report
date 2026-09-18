import RNFS from 'react-native-fs';

import { MediaStorageError } from '../../domain/errors/mediaStorageError';
import type {
  ILocalFileService,
  SaveFileResult,
} from '../../domain/services/ILocalFileService';
import { generateThumbnailImage } from '../../services/imageProcessingService';
import { toMediaStorageError } from './fsErrors';
import {
  getAppDataRoot,
  getReportDir,
  getTempRoot,
  isOwnedAppPath,
} from './mediaPaths';

function normalizePath(uri: string): string {
  return uri.startsWith('file://') ? uri.slice('file://'.length) : uri;
}

async function ensureDir(path: string): Promise<void> {
  const exists = await RNFS.exists(path);
  if (!exists) {
    try {
      await RNFS.mkdir(path);
    } catch (error) {
      throw toMediaStorageError(
        error,
        'WRITE_FAILED',
        'Could not prepare local storage.',
      );
    }
  }
}

class LocalFileService implements ILocalFileService {
  private get appRoot(): string {
    return getAppDataRoot(RNFS.DocumentDirectoryPath);
  }

  async ensureAppDirectories(): Promise<void> {
    await ensureDir(this.appRoot);
    await ensureDir(`${this.appRoot}/reports`);
    await ensureDir(`${this.appRoot}/business`);
    await ensureDir(getTempRoot(RNFS.DocumentDirectoryPath));
  }

  async ensureReportDirectories(reportId: string): Promise<void> {
    await this.ensureAppDirectories();
    const base = getReportDir(RNFS.DocumentDirectoryPath, reportId);
    await ensureDir(base);
    await ensureDir(`${base}/images`);
    await ensureDir(`${base}/thumbnails`);
    await ensureDir(`${base}/pdfs`);
  }

  async assertAvailableStorage(minBytes: number): Promise<void> {
    try {
      const info = await RNFS.getFSInfo();
      if (info.freeSpace < minBytes) {
        throw new MediaStorageError(
          'INSUFFICIENT_STORAGE',
          'Not enough storage space to save this photo.',
        );
      }
    } catch (error) {
      if (error instanceof MediaStorageError) {
        throw error;
      }
      // If FS info is unavailable, continue and let copy fail naturally.
    }
  }

  private async copyFileSafe(sourceUri: string, destination: string): Promise<void> {
    try {
      await RNFS.copyFile(normalizePath(sourceUri), destination);
    } catch (error) {
      throw toMediaStorageError(
        error,
        'COPY_FAILED',
        'Could not copy the selected image into app storage.',
      );
    }
  }

  private async copyIntoReportSubdir(
    reportId: string,
    subdir: 'images' | 'thumbnails',
    sourceUri: string,
    fileName: string,
  ): Promise<SaveFileResult> {
    await this.ensureReportDirectories(reportId);
    const destination = `${getReportDir(RNFS.DocumentDirectoryPath, reportId)}/${subdir}/${fileName}`;
    await this.copyFileSafe(sourceUri, destination);
    return { path: destination };
  }

  async savePhoto(
    reportId: string,
    sourceUri: string,
    fileName: string,
  ): Promise<SaveFileResult> {
    return this.copyIntoReportSubdir(reportId, 'images', sourceUri, fileName);
  }

  async generateThumbnail(
    reportId: string,
    sourceImagePath: string,
    fileName: string,
  ): Promise<SaveFileResult> {
    await this.ensureReportDirectories(reportId);
    const destination = `${getReportDir(RNFS.DocumentDirectoryPath, reportId)}/thumbnails/${fileName}`;
    const generatedPath = await generateThumbnailImage(sourceImagePath, destination);
    return { path: generatedPath };
  }

  async saveSignature(
    reportId: string,
    sourceUri: string,
    fileName: string,
  ): Promise<SaveFileResult> {
    await this.ensureReportDirectories(reportId);
    const destination = `${getReportDir(RNFS.DocumentDirectoryPath, reportId)}/${fileName}`;
    await this.copyFileSafe(sourceUri, destination);
    return { path: destination };
  }

  async saveLogo(sourceUri: string, fileName: string): Promise<SaveFileResult> {
    await this.ensureAppDirectories();
    const destination = `${this.appRoot}/business/${fileName}`;
    await this.copyFileSafe(sourceUri, destination);
    return { path: destination };
  }

  async deleteFile(path: string): Promise<void> {
    const normalized = normalizePath(path);
    if (!isOwnedAppPath(RNFS.DocumentDirectoryPath, normalized)) {
      return;
    }

    try {
      if (await RNFS.exists(normalized)) {
        await RNFS.unlink(normalized);
      }
    } catch (error) {
      console.warn('Failed to delete owned file:', normalized, error);
    }
  }

  async deleteReportMedia(reportId: string): Promise<void> {
    const dir = getReportDir(RNFS.DocumentDirectoryPath, reportId);
    if (!isOwnedAppPath(RNFS.DocumentDirectoryPath, dir)) {
      return;
    }

    try {
      if (await RNFS.exists(dir)) {
        await RNFS.unlink(dir);
      }
    } catch (error) {
      console.warn('Failed to delete report media directory:', dir, error);
    }
  }

  async fileExists(path: string): Promise<boolean> {
    return RNFS.exists(normalizePath(path));
  }

  async listTempFiles(): Promise<string[]> {
    const tempRoot = getTempRoot(RNFS.DocumentDirectoryPath);
    if (!(await RNFS.exists(tempRoot))) {
      return [];
    }

    try {
      const entries = await RNFS.readDir(tempRoot);
      return entries.filter(entry => entry.isFile()).map(entry => entry.name);
    } catch (error) {
      console.warn('Failed to list temp files:', error);
      return [];
    }
  }

  async deleteTempFile(fileName: string): Promise<void> {
    const tempPath = `${getTempRoot(RNFS.DocumentDirectoryPath)}/${fileName}`;
    await this.deleteFile(tempPath);
  }
}

export const localFileService: ILocalFileService = new LocalFileService();
