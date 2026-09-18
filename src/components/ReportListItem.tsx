import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {REPORT_STATUS_LABELS} from '../constants/reportStatuses';
import {REPORT_TYPE_LABELS} from '../constants/reportTypes';
import {colors, spacing} from '../constants/theme';
import type {ReportListItem as ReportListItemType} from '../models/types';
import {formatDisplayDate, formatRelativeTime} from '../utils/dates';

interface ReportListItemProps {
  report: ReportListItemType;
  onPress: () => void;
}

export function ReportListItem({report, onPress}: ReportListItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [styles.container, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Text style={styles.customerName} numberOfLines={1}>
          {report.customerName || 'Untitled Report'}
        </Text>
        <Text style={styles.reportNumber}>{report.reportNumber}</Text>
      </View>
      <Text style={styles.meta}>
        {REPORT_TYPE_LABELS[report.reportType]} ·{' '}
        {formatDisplayDate(report.reportDate)}
      </Text>
      {report.address ? (
        <Text style={styles.address} numberOfLines={1}>{report.address}</Text>
      ) : null}
      <View style={styles.footer}>
        <Text style={styles.status}>{REPORT_STATUS_LABELS[report.status]}</Text>
        <Text style={styles.stats}>
          {report.photoCount} photos · {report.sectionCount} sections
        </Text>
        <Text style={styles.updated}>{formatRelativeTime(report.updatedAt)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  customerName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  reportNumber: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  address: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: '#E8F0FA',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stats: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  updated: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 'auto',
  },
});
