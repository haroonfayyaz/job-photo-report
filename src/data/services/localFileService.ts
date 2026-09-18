import RNFS from 'react-native-fs';

import type {
  ILocalFileService,
  SaveFileResult,
} from '../../domain/services/ILocalFileService';

const APP_ROOT = `${RNFS.DocumentDirectoryPath}/app-data`;

function normalizePath(uri: string): string {
  return uri.startsWith('file://') ? uri.slice('file://'.length) : uri;
}

async function ensureDir(path: string): Promise<void> {
  const exists = await RNFS.exists(path);
  if (!exists) {
    await RNFS.mkdir(path);
  }
}

function reportDir(reportId: string): string {
  return `${APP_ROOT}/reports/${reportId}`;
}

class LocalFileService implements ILocalFileService {
  async ensureAppDirectories(): Promise<void> {
    await ensureDir(APP_ROOT);
    await ensureDir(`${APP_ROOT}/reports`);
    await ensureDir(`${APP_ROOT}/business`);
  }

  async ensureReportDirectories(reportId: string): Promise<void> {
    await this.ensureAppDirectories();
    await ensureDir(reportDir(reportId));
    await ensureDir(`${reportDir(reportId)}/images`);
    await ensureDir(`${reportDir(reportId)}/thumbnails`);
  }

  private async copyIntoReportSubdir(
    reportId: string,
    subdir: 'images' | 'thumbnails',
    sourceUri: string,
    fileName: string,
  ): Promise<SaveFileResult> {
    await this.ensureReportDirectories(reportId);
    const destination = `${reportDir(reportId)}/${subdir}/${fileName}`;
    await RNFS.copyFile(normalizePath(sourceUri), destination);
    return { path: destination };
  }

  async savePhoto(
    reportId: string,
    sourceUri: string,
    fileName: string,
  ): Promise<SaveFileResult> {
    return this.copyIntoReportSubdir(reportId, 'images', sourceUri, fileName);
  }

  async saveThumbnail(
    reportId: string,
    sourceUri: string,
    fileName: string,
  ): Promise<SaveFileResult> {
    // Step 06 will replace this with a resized thumbnail.
    return this.copyIntoReportSubdir(reportId, 'thumbnails', sourceUri, fileName);
  }

  async saveSignature(
    reportId: string,
    sourceUri: string,
    fileName: string,
  ): Promise<SaveFileResult> {
    await this.ensureReportDirectories(reportId);
    const destination = `${reportDir(reportId)}/${fileName}`;
    await RNFS.copyFile(normalizePath(sourceUri), destination);
    return { path: destination };
  }

  async saveLogo(sourceUri: string, fileName: string): Promise<SaveFileResult> {
    await this.ensureAppDirectories();
    const destination = `${APP_ROOT}/business/${fileName}`;
    await RNFS.copyFile(normalizePath(sourceUri), destination);
    return { path: destination };
  }

  async deleteFile(path: string): Promise<void> {
    const normalized = normalizePath(path);
    if (await RNFS.exists(normalized)) {
      await RNFS.unlink(normalized);
    }
  }

  async deleteReportMedia(reportId: string): Promise<void> {
    const dir = reportDir(reportId);
    if (await RNFS.exists(dir)) {
      await RNFS.unlink(dir);
    }
  }

  async fileExists(path: string): Promise<boolean> {
    return RNFS.exists(normalizePath(path));
  }
}

export const localFileService: ILocalFileService = new LocalFileService();
