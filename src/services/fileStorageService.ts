import RNFS from 'react-native-fs';

const APP_ROOT = `${RNFS.DocumentDirectoryPath}/JobPhotoReport`;

export const STORAGE_DIRS = {
  root: APP_ROOT,
  photos: `${APP_ROOT}/photos`,
  thumbnails: `${APP_ROOT}/thumbnails`,
  signatures: `${APP_ROOT}/signatures`,
  logos: `${APP_ROOT}/logos`,
  pdfs: `${APP_ROOT}/pdfs`,
  exports: `${APP_ROOT}/exports`,
} as const;

export async function ensureStorageDirectories(): Promise<void> {
  const directories = Object.values(STORAGE_DIRS);
  for (const dir of directories) {
    const exists = await RNFS.exists(dir);
    if (!exists) {
      await RNFS.mkdir(dir);
    }
  }
}

export function getPhotoDirectory(reportId: string): string {
  return `${STORAGE_DIRS.photos}/${reportId}`;
}

export function getThumbnailDirectory(reportId: string): string {
  return `${STORAGE_DIRS.thumbnails}/${reportId}`;
}

export async function ensureReportMediaDirectories(
  reportId: string,
): Promise<void> {
  const photoDir = getPhotoDirectory(reportId);
  const thumbDir = getThumbnailDirectory(reportId);

  for (const dir of [photoDir, thumbDir]) {
    const exists = await RNFS.exists(dir);
    if (!exists) {
      await RNFS.mkdir(dir);
    }
  }
}

export async function deleteReportMedia(reportId: string): Promise<void> {
  const photoDir = getPhotoDirectory(reportId);
  const thumbDir = getThumbnailDirectory(reportId);

  for (const dir of [photoDir, thumbDir]) {
    const exists = await RNFS.exists(dir);
    if (exists) {
      await RNFS.unlink(dir);
    }
  }
}

export async function deleteFileIfExists(path: string): Promise<void> {
  const exists = await RNFS.exists(path);
  if (exists) {
    await RNFS.unlink(path);
  }
}
