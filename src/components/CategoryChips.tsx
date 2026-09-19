import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CATEGORY_LABELS, FAST_CATEGORY_OPTIONS } from '../constants/categoryLabels';
import type { PhotoCategory } from '../domain/enums';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button } from './Button';

interface CategoryChipsProps {
  value: PhotoCategory;
  onChange: (category: PhotoCategory) => void;
  compact?: boolean;
}

export function CategoryChips({
  value,
  onChange,
  compact = false,
}: CategoryChipsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {FAST_CATEGORY_OPTIONS.map(category => (
          <Button
            key={category}
            label={CATEGORY_LABELS[category]}
            variant={value === category ? 'primary' : 'secondary'}
            onPress={() => onChange(category)}
            style={compact ? styles.compactChip : styles.chip}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    textTransform: 'none',
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  compactChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 40,
  },
});
