export const APP_DATA_DIR_NAME = 'app-data';
export const REPORTS_DIR_NAME = 'reports';
export const TEMP_DIR_NAME = 'temp';
export const IMAGES_DIR_NAME = 'images';
export const THUMBNAILS_DIR_NAME = 'thumbnails';
export const PDFS_DIR_NAME = 'pdfs';

export const THUMBNAIL_MAX_DIMENSION = 400;
export const THUMBNAIL_JPEG_QUALITY = 80;
export const MIN_FREE_BYTES_FOR_IMPORT = 5 * 1024 * 1024;

export function getAppDataRoot(documentDirectoryPath: string): string {
  return `${documentDirectoryPath}/${APP_DATA_DIR_NAME}`;
}

export function getReportsRoot(documentDirectoryPath: string): string {
  return `${getAppDataRoot(documentDirectoryPath)}/${REPORTS_DIR_NAME}`;
}

export function getTempRoot(documentDirectoryPath: string): string {
  return `${getAppDataRoot(documentDirectoryPath)}/${TEMP_DIR_NAME}`;
}

export function getReportDir(
  documentDirectoryPath: string,
  reportId: string,
): string {
  return `${getReportsRoot(documentDirectoryPath)}/${reportId}`;
}

export function getReportImagesDir(
  documentDirectoryPath: string,
  reportId: string,
): string {
  return `${getReportDir(documentDirectoryPath, reportId)}/${IMAGES_DIR_NAME}`;
}

export function getReportThumbnailsDir(
  documentDirectoryPath: string,
  reportId: string,
): string {
  return `${getReportDir(documentDirectoryPath, reportId)}/${THUMBNAILS_DIR_NAME}`;
}

export function getReportPdfsDir(
  documentDirectoryPath: string,
  reportId: string,
): string {
  return `${getReportDir(documentDirectoryPath, reportId)}/${PDFS_DIR_NAME}`;
}

export function buildOriginalPhotoFileName(
  photoId: string,
  extension: string,
): string {
  return `${photoId}-original${extension}`;
}

export function buildThumbnailPhotoFileName(
  photoId: string,
  extension = '.jpg',
): string {
  return `${photoId}-thumb${extension}`;
}

export function buildOriginalPhotoPath(
  documentDirectoryPath: string,
  reportId: string,
  photoId: string,
  extension: string,
): string {
  return `${getReportImagesDir(documentDirectoryPath, reportId)}/${buildOriginalPhotoFileName(photoId, extension)}`;
}

export function buildThumbnailPhotoPath(
  documentDirectoryPath: string,
  reportId: string,
  photoId: string,
  extension = '.jpg',
): string {
  return `${getReportThumbnailsDir(documentDirectoryPath, reportId)}/${buildThumbnailPhotoFileName(photoId, extension)}`;
}

export function isOwnedAppPath(
  documentDirectoryPath: string,
  filePath: string,
): boolean {
  const normalized = filePath.startsWith('file://')
    ? filePath.slice('file://'.length)
    : filePath;
  const appRoot = `${getAppDataRoot(documentDirectoryPath)}/`;
  return normalized.startsWith(appRoot);
}
