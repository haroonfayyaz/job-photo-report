import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { STATUS_LABELS } from '../constants/statusLabels';
import { TEMPLATE_LABELS } from '../constants/templateLabels';
import type { ReportSummary } from '../domain/models';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadow } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatDisplayDate, formatRelativeTime } from '../utils/dates';

interface ReportListItemProps {
  report: ReportSummary;
  onPress: () => void;
}

export function ReportListItem({ report, onPress }: ReportListItemProps) {
  const displayTitle = report.title || report.customerName || 'Untitled Report';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{displayTitle}</Text>
        <Text style={styles.reportNumber}>{report.reportNumber}</Text>
      </View>

      {report.customerName && report.title ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {report.customerName}
        </Text>
      ) : null}

      <Text style={styles.meta}>
        {TEMPLATE_LABELS[report.templateKey]} ·{' '}
        {formatDisplayDate(report.reportDate)}
      </Text>

      {report.siteAddress ? (
        <Text style={styles.address} numberOfLines={1}>
          {report.siteAddress}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.status}>{STATUS_LABELS[report.status]}</Text>
        <Text style={styles.stats}>
          {report.photoCount} photo{report.photoCount === 1 ? '' : 's'}
          {report.sectionCount > 0
            ? ` · ${report.sectionCount} section${report.sectionCount === 1 ? '' : 's'}`
            : ''}
        </Text>
        <Text style={styles.updated}>{formatRelativeTime(report.updatedAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow('sm'),
  },
  pressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.heading,
    flex: 1,
    fontSize: 17,
  },
  reportNumber: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  meta: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  address: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  status: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  stats: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  updated: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 'auto',
  },
});
