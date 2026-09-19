import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { ReportSection } from '../domain/models';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Button } from './Button';

interface SectionPickerProps {
  sections: ReportSection[];
  value: string | null;
  onChange: (sectionId: string | null) => void;
}

export function SectionPicker({ sections, value, onChange }: SectionPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Section</Text>
      <View style={styles.chipRow}>
        <Button
          label="Unassigned"
          variant={value == null ? 'primary' : 'secondary'}
          onPress={() => onChange(null)}
          style={styles.chip}
        />
        {sections.map(section => (
          <Button
            key={section.id}
            label={section.title}
            variant={value === section.id ? 'primary' : 'secondary'}
            onPress={() => onChange(section.id)}
            style={styles.chip}
          />
        ))}
      </View>
      {sections.length === 0 ? (
        <Text style={styles.hint}>
          Add sections on the report screen to organize photos.
        </Text>
      ) : null}
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
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
