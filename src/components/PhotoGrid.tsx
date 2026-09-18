import React from 'react';
import { FlatList, StyleSheet } from 'react-native';

import type { ReportPhoto } from '../domain/models';
import { spacing } from '../theme/spacing';
import { PhotoThumbnail } from './PhotoThumbnail';

interface PhotoGridProps {
  photos: ReportPhoto[];
  onPhotoPress: (photo: ReportPhoto) => void;
}

const COLUMNS = 3;

export function PhotoGrid({ photos, onPhotoPress }: PhotoGridProps) {
  return (
    <FlatList
      data={photos}
      keyExtractor={item => item.id}
      numColumns={COLUMNS}
      scrollEnabled={false}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <PhotoThumbnail
          photo={item}
          onPress={() => onPhotoPress(item)}
          style={styles.item}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.sm,
  },
  item: {
    width: '31.5%',
  },
});
