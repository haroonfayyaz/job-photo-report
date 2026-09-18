import { getFileExtension, toImageUri } from '../../src/utils/fileUri';

describe('fileUri utils', () => {
  it('adds file scheme for absolute paths', () => {
    expect(toImageUri('/data/photo.jpg')).toBe('file:///data/photo.jpg');
  });

  it('preserves existing file and content URIs', () => {
    expect(toImageUri('file:///data/photo.jpg')).toBe('file:///data/photo.jpg');
    expect(toImageUri('content://media/1')).toBe('content://media/1');
  });

  it('derives extensions from file names and mime types', () => {
    expect(getFileExtension('/tmp/photo', 'image.PNG')).toBe('.png');
    expect(getFileExtension('/tmp/photo', null, 'image/heic')).toBe('.heic');
    expect(getFileExtension('/tmp/photo')).toBe('.jpg');
  });
});
