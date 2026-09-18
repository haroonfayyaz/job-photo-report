import { MediaStorageError } from '../../domain/errors/mediaStorageError';

function isInsufficientStorageMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('no space') ||
    lower.includes('enospc') ||
    lower.includes('insufficient') ||
    lower.includes('not enough')
  );
}

export function toMediaStorageError(
  error: unknown,
  fallbackCode: 'COPY_FAILED' | 'WRITE_FAILED',
  fallbackMessage: string,
): MediaStorageError {
  if (error instanceof MediaStorageError) {
    return error;
  }

  const message =
    error instanceof Error ? error.message : String(error ?? fallbackMessage);

  if (isInsufficientStorageMessage(message)) {
    return new MediaStorageError(
      'INSUFFICIENT_STORAGE',
      'Not enough storage space to save this photo.',
      { cause: error },
    );
  }

  return new MediaStorageError(fallbackCode, fallbackMessage, { cause: error });
}
