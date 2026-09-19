import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { CategoryChips } from '../components/CategoryChips';
import { FormField } from '../components/FormField';
import { SectionPicker } from '../components/SectionPicker';
import { CATEGORY_LABELS } from '../constants/categoryLabels';
import {
  getPhotoById,
  listPhotosByReportId,
  updatePhoto,
} from '../data/repositories/photoRepository';
import { listSectionsByReportId } from '../data/repositories/sectionRepository';
import type { PhotoCategory } from '../domain/enums';
import type { ReportPhoto, ReportSection } from '../domain/models';
import type { RootStackParamList } from '../navigation/types';
import { deletePhotoWithMedia } from '../services/mediaCleanupService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatDisplayDate } from '../utils/dates';
import { toImageUri } from '../utils/fileUri';
import {
  flattenPhotoIds,
  groupPhotosBySection,
} from '../utils/groupPhotosBySection';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoDetail'>;

export function PhotoDetailScreen({ navigation, route }: Props) {
  const { photoId, reportId, photoIds, fastMode = false } = route.params;
  const [photo, setPhoto] = useState<ReportPhoto | null>(null);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<PhotoCategory>('UNCATEGORIZED');
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const orderedPhotoIds = useMemo(() => {
    if (photoIds && photoIds.length > 0) {
      return photoIds;
    }

    const photos = listPhotosByReportId(reportId);
    const reportSections = listSectionsByReportId(reportId);
    return flattenPhotoIds(groupPhotosBySection(reportSections, photos));
  }, [photoIds, reportId]);

  const currentIndex = orderedPhotoIds.indexOf(photoId);
  const hasPrevious = currentIndex > 0;
  const hasNext =
    currentIndex >= 0 && currentIndex < orderedPhotoIds.length - 1;

  const loadPhoto = useCallback(() => {
    const data = getPhotoById(photoId);
    if (!data) {
      Alert.alert('Not found', 'This photo could not be found.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    setPhoto(data);
    setCaption(data.caption);
    setCategory(data.category);
    setSectionId(data.sectionId);
    setSections(listSectionsByReportId(reportId));
    navigation.setOptions({
      title: fastMode ? 'Categorize Photo' : 'Photo',
    });
    setLoading(false);
  }, [fastMode, navigation, photoId, reportId]);

  useEffect(() => {
    setLoading(true);
    loadPhoto();
  }, [loadPhoto]);

  const persistChanges = useCallback((): ReportPhoto | null => {
    const updated = updatePhoto(photoId, {
      caption,
      category,
      sectionId,
    });
    if (updated) {
      setPhoto(updated);
    }
    return updated;
  }, [caption, category, photoId, sectionId]);

  const navigateToPhoto = (nextPhotoId: string) => {
    navigation.replace('PhotoDetail', {
      photoId: nextPhotoId,
      reportId,
      photoIds: orderedPhotoIds,
      fastMode,
    });
  };

  const handleSave = () => {
    setSaving(true);
    try {
      persistChanges();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNext = () => {
    setSaving(true);
    try {
      const updated = persistChanges();
      if (!updated) {
        return;
      }

      if (hasNext) {
        navigateToPhoto(orderedPhotoIds[currentIndex + 1]);
        return;
      }

      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete photo?', 'This photo will be removed from the report.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await deletePhotoWithMedia(photoId);
            if (hasNext) {
              navigateToPhoto(orderedPhotoIds[currentIndex + 1]);
              return;
            }
            if (hasPrevious) {
              navigateToPhoto(orderedPhotoIds[currentIndex - 1]);
              return;
            }
            navigation.goBack();
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!photo) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.imageFrame}>
          <Image
            source={{ uri: toImageUri(photo.originalPath) }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.meta}>
          Captured {formatDisplayDate(photo.capturedAt)}
          {orderedPhotoIds.length > 1
            ? ` · ${currentIndex + 1} of ${orderedPhotoIds.length}`
            : ''}
        </Text>

        {photo.category !== 'UNCATEGORIZED' ? (
          <Text style={styles.currentCategory}>
            Current: {CATEGORY_LABELS[photo.category]}
          </Text>
        ) : null}

        <CategoryChips value={category} onChange={setCategory} />

        <FormField
          label="Caption"
          value={caption}
          onChangeText={setCaption}
          placeholder="Optional quick note"
          multiline
        />

        <SectionPicker
          sections={sections}
          value={sectionId}
          onChange={setSectionId}
        />

        <View style={styles.navRow}>
          <Button
            label="Previous"
            variant="secondary"
            disabled={!hasPrevious || saving}
            onPress={() => {
              persistChanges();
              navigateToPhoto(orderedPhotoIds[currentIndex - 1]);
            }}
            style={styles.navButton}
          />
          <Button
            label="Next"
            variant="secondary"
            disabled={!hasNext || saving}
            onPress={() => {
              persistChanges();
              navigateToPhoto(orderedPhotoIds[currentIndex + 1]);
            }}
            style={styles.navButton}
          />
        </View>

        <Button
          label={saving ? 'Saving...' : 'Save'}
          disabled={saving}
          onPress={handleSave}
        />
        <Button
          label={saving ? 'Saving...' : hasNext ? 'Save & Next' : 'Save & Done'}
          disabled={saving}
          onPress={handleSaveAndNext}
        />
        <Button
          label="Delete Photo"
          variant="secondary"
          disabled={saving}
          onPress={handleDelete}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  imageFrame: {
    minHeight: 240,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    minHeight: 240,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  currentCategory: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  navButton: {
    flex: 1,
  },
});
