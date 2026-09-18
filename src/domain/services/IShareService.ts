export interface ShareFileOptions {
  filePath: string;
  title?: string;
  mimeType?: string;
}

/**
 * Contract for sharing generated files via the platform share sheet.
 * Implementation deferred to a later step.
 */
export interface IShareService {
  shareFile(options: ShareFileOptions): Promise<void>;
}
