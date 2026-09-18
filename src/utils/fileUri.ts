export function toImageUri(path: string): string {
  if (path.startsWith('file://') || path.startsWith('content://')) {
    return path;
  }
  return `file://${path}`;
}

export function getFileExtension(
  uri: string,
  fileName?: string | null,
  mimeType?: string | null,
): string {
  const fromName = (fileName ?? uri).match(/\.([a-zA-Z0-9]+)$/);
  if (fromName?.[1]) {
    return `.${fromName[1].toLowerCase()}`;
  }

  if (mimeType?.includes('png')) {
    return '.png';
  }
  if (mimeType?.includes('heic') || mimeType?.includes('heif')) {
    return '.heic';
  }
  if (mimeType?.includes('webp')) {
    return '.webp';
  }

  return '.jpg';
}
