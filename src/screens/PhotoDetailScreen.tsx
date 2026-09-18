import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getPhotoById } from '../data/repositories/photoRepository';
import type { ReportPhoto } from '../domain/models';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatDisplayDate } from '../utils/dates';
import { toImageUri } from '../utils/fileUri';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoDetail'>;

export function PhotoDetailScreen({ navigation, route }: Props) {
  const { photoId } = route.params;
  const [photo, setPhoto] = useState<ReportPhoto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getPhotoById(photoId);
    if (!data) {
      Alert.alert('Not found', 'This photo could not be found.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    setPhoto(data);
    setLoading(false);
  }, [navigation, photoId]);

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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.imageFrame}>
        <Image
          source={{ uri: toImageUri(photo.originalPath) }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      <View style={styles.meta}>
        <Text style={styles.label}>Captured</Text>
        <Text style={styles.value}>{formatDisplayDate(photo.capturedAt)}</Text>
      </View>

      {photo.caption ? (
        <View style={styles.meta}>
          <Text style={styles.label}>Caption</Text>
          <Text style={styles.value}>{photo.caption}</Text>
        </View>
      ) : (
        <Text style={styles.placeholder}>
          Captions and categories can be edited in a later step.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    minHeight: 280,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    minHeight: 280,
  },
  meta: {
    gap: 4,
  },
  label: {
    ...typography.label,
    textTransform: 'none',
    color: colors.textMuted,
    fontSize: 12,
  },
  value: {
    ...typography.body,
  },
  placeholder: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
