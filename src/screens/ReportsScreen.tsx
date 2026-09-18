import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { IconBadge } from '../components/IconBadge';
import { ScreenContainer } from '../components/ScreenContainer';
import { env } from '../config/env';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadow } from '../theme/shadows';
import { minTouchTarget, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Reports'>;

function ReportsHeaderRight() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={() => navigation.navigate('Settings')}
      style={styles.headerButton}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Text style={styles.headerButtonText}>Settings</Text>
    </TouchableOpacity>
  );
}

export function ReportsScreen({ navigation }: Props) {
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: ReportsHeaderRight,
    });
  }, [navigation]);

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.heroAccent} />
        <View style={styles.heroContent}>
          <Text style={styles.heroLabel}>Field reports</Text>
          <Text style={styles.heroTitle}>{env.appName}</Text>
          <Text style={styles.heroSubtitle}>
            Capture, organize, and share job photos — fully offline.
          </Text>
        </View>
      </View>

      <Card style={styles.emptyCard}>
        <View style={styles.emptyContent}>
          <IconBadge symbol="📋" variant="primary" />
          <Text style={typography.heading}>No reports yet</Text>
          <Text style={styles.message}>
            Start your first report in about a minute. Add photos, sections, and
            export a PDF when those features land.
          </Text>
        </View>
        <Button
          label="Create New Report"
          onPress={() => navigation.navigate('NewReport')}
        />
      </Card>

      <View style={styles.tipRow}>
        <View style={styles.tipDot} />
        <Text style={styles.tipText}>
          Works without internet — everything stays on your device.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow('lg'),
  },
  heroAccent: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroContent: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  heroLabel: {
    ...typography.label,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  heroTitle: {
    ...typography.display,
    color: colors.onPrimary,
  },
  heroSubtitle: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: spacing.xs,
  },
  emptyCard: {
    gap: spacing.lg,
  },
  emptyContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  tipText: {
    ...typography.caption,
    flex: 1,
    color: colors.textMuted,
  },
  headerButton: {
    marginRight: spacing.sm,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
  },
  headerButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 14,
  },
});
