import ImageResizer from '@bam.tech/react-native-image-resizer';
import RNFS from 'react-native-fs';

import {
  THUMBNAIL_JPEG_QUALITY,
  THUMBNAIL_MAX_DIMENSION,
} from '../data/services/mediaPaths';
import { MediaStorageError } from '../domain/errors/mediaStorageError';

function normalizePath(path: string): string {
  return path.startsWith('file://') ? path.slice('file://'.length) : path;
}

async function moveResizedImageToDestination(
  resizedPath: string,
  destination: string,
): Promise<void> {
  if (await RNFS.exists(destination)) {
    await RNFS.unlink(destination);
  }

  try {
    await RNFS.moveFile(resizedPath, destination);
  } catch {
    await RNFS.copyFile(resizedPath, destination);
    await RNFS.unlink(resizedPath).catch(() => undefined);
  }
}

/**
 * Uses @bam.tech/react-native-image-resizer (native module) so resizing runs off
 * the JS thread. EXIF orientation is applied automatically on Android.
 * The resized file is written to cache first, then moved into app-owned storage.
 */
export async function generateThumbnailImage(
  sourceImagePath: string,
  outputPath: string,
): Promise<string> {
  const destination = normalizePath(outputPath);

  try {
    const result = await ImageResizer.createResizedImage(
      normalizePath(sourceImagePath),
      THUMBNAIL_MAX_DIMENSION,
      THUMBNAIL_MAX_DIMENSION,
      'JPEG',
      THUMBNAIL_JPEG_QUALITY,
      0,
      null,
      false,
      { mode: 'cover', onlyScaleDown: true },
    );

    const resizedPath = normalizePath(result.path ?? result.uri);
    await moveResizedImageToDestination(resizedPath, destination);
    return destination;
  } catch (error) {
    throw new MediaStorageError(
      'THUMBNAIL_FAILED',
      'Could not generate a thumbnail for this photo.',
      { cause: error },
    );
  }
}
