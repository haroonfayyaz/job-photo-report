import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { IconBadge } from '../components/IconBadge';
import { ScreenContainer } from '../components/ScreenContainer';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const PROFILE_FIELDS = [
  'Company name & logo',
  'Phone, email & website',
  'Business address',
  'Default technician name',
];

export function SettingsScreen(_props: Props) {
  return (
    <ScreenContainer scroll>
      <Card style={styles.card}>
        <View style={styles.header}>
          <IconBadge symbol="🏢" variant="muted" size="md" />
          <View style={styles.headerText}>
            <Text style={typography.heading}>Business Profile</Text>
            <Text style={styles.subtitle}>Branding for PDF reports</Text>
          </View>
        </View>

        <Text style={styles.message}>
          Your company details will appear on every generated report. Setup
          arrives in a later step.
        </Text>

        <View style={styles.fieldList}>
          {PROFILE_FIELDS.map((field, index) => (
            <View key={field} style={styles.fieldRow}>
              <View style={styles.fieldNumber}>
                <Text style={styles.fieldNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.fieldLabel}>{field}</Text>
            </View>
          ))}
        </View>
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
    color: colors.textMuted,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
  },
  fieldList: {
    gap: spacing.sm,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  fieldNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldNumberText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  fieldLabel: {
    ...typography.body,
    flex: 1,
    color: colors.text,
  },
});
