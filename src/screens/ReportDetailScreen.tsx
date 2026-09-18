import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {REPORT_STATUS_LABELS} from '../constants/reportStatuses';
import {REPORT_TYPE_LABELS} from '../constants/reportTypes';
import {colors, spacing} from '../constants/theme';
import type {Report, ReportSection} from '../models/types';
import type {RootStackParamList} from '../navigation/types';
import {listPhotosByReportId} from '../repositories/photoRepository';
import {getReportById} from '../repositories/reportRepository';
import {listSectionsByReportId} from '../repositories/sectionRepository';
import {formatDisplayDate} from '../utils/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'ReportDetail'>;

export function ReportDetailScreen({route, navigation}: Props) {
  const {reportId} = route.params;
  const [report, setReport] = useState<Report | null>(null);
  const [sections, setSections] = useState<ReportSection[]>([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(() => {
    try {
      const reportData = getReportById(reportId);
      if (!reportData) {
        Alert.alert('Not found', 'This report could not be found.', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
        return;
      }

      setReport(reportData);
      setSections(listSectionsByReportId(reportId));
      setPhotoCount(listPhotosByReportId(reportId).length);
      navigation.setOptions({title: reportData.reportNumber});
    } catch (error) {
      console.error('Failed to load report:', error);
      Alert.alert('Error', 'Could not load this report.');
    } finally {
      setLoading(false);
    }
  }, [navigation, reportId]);

  useFocusEffect(
    useCallback(() => {
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

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.customerName}>{report.customerName}</Text>
        <Text style={styles.meta}>
          {REPORT_TYPE_LABELS[report.reportType]} ·{' '}
          {formatDisplayDate(report.reportDate)}
        </Text>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>{REPORT_STATUS_LABELS[report.status]}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <DetailRow label="Report #" value={report.reportNumber} />
        {report.address ? (
          <DetailRow label="Address" value={report.address} />
        ) : null}
        {report.referenceNumber ? (
          <DetailRow label="Reference" value={report.referenceNumber} />
        ) : null}
        {report.technicianName ? (
          <DetailRow label="Technician" value={report.technicianName} />
        ) : null}
        {report.generalNotes ? (
          <DetailRow label="Notes" value={report.generalNotes} />
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summaryText}>
          {photoCount} photo{photoCount === 1 ? '' : 's'} · {sections.length}{' '}
          section{sections.length === 1 ? '' : 's'}
        </Text>
        {sections.length > 0 ? (
          <View style={styles.sectionList}>
            {sections.map(section => (
              <Text key={section.id} style={styles.sectionItem}>
                • {section.title}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.placeholder}>
            Photo capture, sections, captions, signature, and PDF export will be
            added in upcoming steps.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

function DetailRow({label, value}: {label: string; value: string}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customerName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: '#E8F0FA',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  summaryText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  sectionList: {
    gap: spacing.xs,
  },
  sectionItem: {
    fontSize: 14,
    color: colors.text,
  },
  placeholder: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  detailRow: {
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
  },
});
