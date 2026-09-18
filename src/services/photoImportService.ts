import { Alert, Linking, Platform } from 'react-native';
import {
  type Asset,
  type ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';

import { isMediaStorageError } from '../domain/errors/mediaStorageError';
import { toUTCString } from '../domain/dates';
import type { ReportPhoto } from '../domain/models';
import { saveImportedPhoto } from './mediaStorageService';
import { getFileExtension } from '../utils/fileUri';
import { generateId } from '../utils/id';

export type PhotoImportResult = {
  imported: ReportPhoto[];
  cancelled: boolean;
};

type PickerSource = 'camera' | 'gallery';

function showPermissionDeniedAlert(source: PickerSource): void {
  const label = source === 'camera' ? 'Camera' : 'Photo library';
  Alert.alert(
    `${label} access needed`,
    `Allow ${label.toLowerCase()} access in Settings to add photos to your report.`,
    [
      { text: 'Not now', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings().catch(() => undefined);
        },
      },
    ],
  );
}

function showPickerError(message?: string): void {
  Alert.alert(
    'Could not add photo',
    message ?? 'Something went wrong while selecting the image.',
  );
}

function showStorageError(error: unknown): void {
  const message =
    isMediaStorageError(error)
      ? error.message
      : 'Could not save the selected photo.';
  Alert.alert('Could not save photo', message);
}

function handlePickerFailure(
  response: ImagePickerResponse,
  source: PickerSource,
): void {
  if (response.errorCode === 'permission') {
    showPermissionDeniedAlert(source);
    return;
  }

  if (response.errorCode === 'camera_unavailable') {
    Alert.alert('Camera unavailable', 'This device does not have a usable camera.');
    return;
  }

  if (response.errorMessage) {
    showPickerError(response.errorMessage);
  }
}

function assetCapturedAt(asset: Asset): string {
  if (asset.timestamp != null) {
    const numeric = Number(asset.timestamp);
    const date = Number.isFinite(numeric)
      ? new Date(numeric)
      : new Date(asset.timestamp);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return toUTCString();
}

async function persistAsset(
  reportId: string,
  asset: Asset,
): Promise<ReportPhoto> {
  if (!asset.uri) {
    throw new Error('Selected image is missing a file path.');
  }

  const photoId = generateId();
  const extension = getFileExtension(asset.uri, asset.fileName, asset.type);

  return saveImportedPhoto({
    reportId,
    photoId,
    sourceUri: asset.uri,
    extension,
    capturedAt: assetCapturedAt(asset),
  });
}

function validAssets(response: ImagePickerResponse): Asset[] {
  return (response.assets ?? []).filter(asset => Boolean(asset.uri));
}

export async function capturePhotoForReport(
  reportId: string,
): Promise<PhotoImportResult> {
  const response = await launchCamera({
    mediaType: 'photo',
    quality: 0.9,
    saveToPhotos: false,
    ...(Platform.OS === 'android' ? { presentationStyle: 'fullScreen' } : {}),
  });

  if (response.didCancel) {
    return { imported: [], cancelled: true };
  }

  if (response.errorCode) {
    handlePickerFailure(response, 'camera');
    return { imported: [], cancelled: false };
  }

  const asset = validAssets(response)[0];
  if (!asset) {
    return { imported: [], cancelled: false };
  }

  try {
    const photo = await persistAsset(reportId, asset);
    return { imported: [photo], cancelled: false };
  } catch (error) {
    showStorageError(error);
    return { imported: [], cancelled: false };
  }
}

export async function importPhotosFromGallery(
  reportId: string,
): Promise<PhotoImportResult> {
  const response = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 0,
    quality: 1,
  });

  if (response.didCancel) {
    return { imported: [], cancelled: true };
  }

  if (response.errorCode) {
    handlePickerFailure(response, 'gallery');
    return { imported: [], cancelled: false };
  }

  const assets = validAssets(response);
  if (assets.length === 0) {
    return { imported: [], cancelled: false };
  }

  const imported: ReportPhoto[] = [];
  for (const asset of assets) {
    try {
      imported.push(await persistAsset(reportId, asset));
    } catch (error) {
      showStorageError(error);
    }
  }

  return { imported, cancelled: false };
}
