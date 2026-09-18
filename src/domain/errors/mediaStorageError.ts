export type MediaStorageErrorCode =
  | 'COPY_FAILED'
  | 'WRITE_FAILED'
  | 'INSUFFICIENT_STORAGE'
  | 'THUMBNAIL_FAILED';

export class MediaStorageError extends Error {
  readonly code: MediaStorageErrorCode;

  constructor(
    code: MediaStorageErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'MediaStorageError';
    this.code = code;
  }
}

export function isMediaStorageError(error: unknown): error is MediaStorageError {
  return error instanceof MediaStorageError;
}
