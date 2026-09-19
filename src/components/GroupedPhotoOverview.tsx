import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ReportPhoto } from '../domain/models';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { PhotoSectionGroup } from '../utils/groupPhotosBySection';
import { PhotoGrid } from './PhotoGrid';

interface GroupedPhotoOverviewProps {
  groups: PhotoSectionGroup[];
  onPhotoPress: (photo: ReportPhoto) => void;
}

export function GroupedPhotoOverview({
  groups,
  onPhotoPress,
}: GroupedPhotoOverviewProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {groups.map(group => (
        <View
          key={group.sectionId ?? 'unassigned'}
          style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <Text style={styles.groupCount}>
              {group.photos.length} photo{group.photos.length === 1 ? '' : 's'}
            </Text>
          </View>
          <PhotoGrid photos={group.photos} onPhotoPress={onPhotoPress} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  groupTitle: {
    ...typography.bodyBold,
    flex: 1,
  },
  groupCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
