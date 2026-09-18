import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { IconBadge } from '../components/IconBadge';
import { STATUS_LABELS } from '../constants/statusLabels';
import { TEMPLATE_LABELS } from '../constants/templateLabels';
import { listPhotosByReportId } from '../data/repositories/photoRepository';
import { getReportById } from '../data/repositories/reportRepository';
import { listSectionsByReportId } from '../data/repositories/sectionRepository';
import type { Report } from '../domain/models';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatDisplayDate, formatRelativeTime } from '../utils/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportDetail'>;

export function ReportDetailScreen({ navigation, route }: Props) {
  const { reportId } = route.params;
  const [report, setReport] = useState<Report | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [sectionCount, setSectionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(() => {
    try {
      const data = getReportById(reportId);
      if (!data) {
        Alert.alert('Not found', 'This report could not be found.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
        return;
      }

      setReport(data);
      setPhotoCount(listPhotosByReportId(reportId).length);
      setSectionCount(listSectionsByReportId(reportId).length);
      navigation.setOptions({ title: data.reportNumber });
    } catch (loadError) {
      console.error('Failed to load report:', loadError);
      Alert.alert('Error', 'Could not load this report.');
    } finally {
      setLoading(false);
    }
  }, [navigation, reportId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadReport();
    }, [loadReport]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!report) {
    return null;
  }

  const displayTitle = report.title || report.customerName;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <Card style={styles.heroCard}>
        <Text style={typography.display}>{displayTitle}</Text>
        <Text style={styles.meta}>
          {TEMPLATE_LABELS[report.templateKey]} ·{' '}
          {formatDisplayDate(report.reportDate)}
        </Text>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>{STATUS_LABELS[report.status]}</Text>
          <Text style={styles.updated}>
            Updated {formatRelativeTime(report.updatedAt)}
          </Text>
        </View>
      </Card>

      <Card style={styles.infoCard}>
        <DetailRow label="Report number" value={report.reportNumber} />
        {report.customerName ? (
          <DetailRow label="Customer / site" value={report.customerName} />
        ) : null}
        {report.siteAddress ? (
          <DetailRow label="Address" value={report.siteAddress} />
        ) : null}
        {report.jobReference ? (
          <DetailRow label="Reference" value={report.jobReference} />
        ) : null}
        {report.technicianName ? (
          <DetailRow label="Technician" value={report.technicianName} />
        ) : null}
        {report.generalNotes ? (
          <DetailRow label="Notes" value={report.generalNotes} />
        ) : null}
      </Card>

      <Card style={styles.placeholderCard}>
        <View style={styles.placeholderHeader}>
          <IconBadge symbol="📷" variant="accent" size="md" />
          <View style={styles.placeholderHeaderText}>
            <Text style={typography.heading}>Sections & photos</Text>
            <Text style={styles.placeholderSubtitle}>
              {photoCount} photo{photoCount === 1 ? '' : 's'} · {sectionCount}{' '}
              section{sectionCount === 1 ? '' : 's'}
            </Text>
          </View>
        </View>
        <Text style={styles.placeholderMessage}>
          Photo capture, sections, and captions will be added in upcoming steps.
        </Text>
        <Button label="Add Photos" variant="secondary" disabled />
      </Card>

      <View style={styles.actions}>
        <Button
          label="Edit Details"
          onPress={() =>
            navigation.navigate('EditReport', { reportId: report.id })
          }
        />
        <Button label="Generate PDF" variant="secondary" disabled />
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  heroCard: {
    gap: spacing.sm,
  },
  meta: {
    ...typography.caption,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  badge: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  updated: {
    ...typography.caption,
    color: colors.textMuted,
  },
  infoCard: {
    gap: spacing.sm,
  },
  detailRow: {
    gap: 2,
  },
  detailLabel: {
    ...typography.label,
    textTransform: 'none',
    fontSize: 12,
    color: colors.textMuted,
  },
  detailValue: {
    ...typography.body,
  },
  placeholderCard: {
    gap: spacing.md,
  },
  placeholderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  placeholderHeaderText: {
    flex: 1,
    gap: 2,
  },
  placeholderSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  placeholderMessage: {
    ...typography.body,
    color: colors.textSecondary,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
