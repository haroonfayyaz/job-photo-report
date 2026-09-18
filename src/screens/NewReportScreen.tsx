import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { IconBadge } from '../components/IconBadge';
import { ScreenContainer } from '../components/ScreenContainer';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'NewReport'>;

const COMING_SOON = [
  { icon: '👤', label: 'Customer & site info' },
  { icon: '📷', label: 'Photo capture & import' },
  { icon: '📂', label: 'Sections & captions' },
];

export function NewReportScreen({ navigation }: Props) {
  return (
    <ScreenContainer scroll>
      <Card style={styles.card}>
        <View style={styles.header}>
          <IconBadge symbol="✨" variant="accent" size="md" />
          <View style={styles.headerText}>
            <Text style={typography.heading}>New Report</Text>
            <Text style={styles.subtitle}>Coming in upcoming steps</Text>
          </View>
        </View>

        <Text style={styles.message}>
          The full report creation flow — customer details, photos, sections,
          and notes — will be built next.
        </Text>

        <View style={styles.featureList}>
          {COMING_SOON.map(item => (
            <View key={item.label} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{item.icon}</Text>
              <Text style={styles.featureLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <Button
          label="Back to Reports"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
  },
  featureList: {
    gap: spacing.sm,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  featureIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  featureLabel: {
    ...typography.body,
    color: colors.text,
  },
});
