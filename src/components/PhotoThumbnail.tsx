import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import type { ReportPhoto } from '../domain/models';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { toImageUri } from '../utils/fileUri';

interface PhotoThumbnailProps {
  photo: ReportPhoto;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function PhotoThumbnail({ photo, onPress, style }: PhotoThumbnailProps) {
  const displayPath = photo.thumbnailPath ?? photo.originalPath;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="View photo"
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}>
      <Image
        source={{ uri: toImageUri(displayPath) }}
        style={styles.image}
        resizeMode="cover"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    opacity: 0.85,
  },
});
