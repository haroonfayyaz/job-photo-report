export interface SaveFileResult {
  path: string;
}

export interface ILocalFileService {
  ensureAppDirectories(): Promise<void>;
  ensureReportDirectories(reportId: string): Promise<void>;
  assertAvailableStorage(minBytes: number): Promise<void>;
  savePhoto(
    reportId: string,
    sourceUri: string,
    fileName: string,
  ): Promise<SaveFileResult>;
  generateThumbnail(
    reportId: string,
    sourceImagePath: string,
    fileName: string,
  ): Promise<SaveFileResult>;
  saveSignature(
    reportId: string,
    sourceUri: string,
    fileName: string,
  ): Promise<SaveFileResult>;
  saveLogo(sourceUri: string, fileName: string): Promise<SaveFileResult>;
  deleteFile(path: string): Promise<void>;
  deleteReportMedia(reportId: string): Promise<void>;
  fileExists(path: string): Promise<boolean>;
  listTempFiles(): Promise<string[]>;
  deleteTempFile(fileName: string): Promise<void>;
}
