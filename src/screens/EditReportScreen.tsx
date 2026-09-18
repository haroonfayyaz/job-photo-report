import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ReportForm, type ReportFormValues } from '../components/ReportForm';
import { ScreenContainer } from '../components/ScreenContainer';
import {
  getReportById,
  updateReport,
} from '../data/repositories/reportRepository';
import type { Report } from '../domain/models';
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'EditReport'>;

function reportToFormValues(report: Report): ReportFormValues {
  return {
    templateKey: report.templateKey,
    title: report.title,
    customerName: report.customerName,
    siteAddress: report.siteAddress,
    jobReference: report.jobReference,
    technicianName: report.technicianName,
    reportDate: report.reportDate,
    generalNotes: report.generalNotes,
  };
}

export function EditReportScreen({ navigation, route }: Props) {
  const { reportId } = route.params;
  const [loadedReport, setLoadedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<ReportFormValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const report = getReportById(reportId);
    if (!report) {
      Alert.alert('Not found', 'This report could not be found.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    setLoadedReport(report);
    setValues(reportToFormValues(report));
    setLoading(false);
  }, [navigation, reportId]);

  const initialSnapshot = useMemo(
    () => (loadedReport ? reportToFormValues(loadedReport) : null),
    [loadedReport],
  );

  const isDirty = useMemo(() => {
    if (!values || !initialSnapshot) {
      return false;
    }
    return JSON.stringify(values) !== JSON.stringify(initialSnapshot);
  }, [initialSnapshot, values]);

  const allowLeave = useUnsavedChangesGuard(isDirty);

  const handleSubmit = () => {
    if (!values) {
      return;
    }

    const trimmedName = values.customerName.trim();
    if (!trimmedName) {
      setError('Customer or site name is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updated = updateReport(reportId, {
        templateKey: values.templateKey,
        title: values.title,
        customerName: trimmedName,
        siteAddress: values.siteAddress,
        jobReference: values.jobReference,
        technicianName: values.technicianName,
        reportDate: values.reportDate,
        generalNotes: values.generalNotes,
      });

      if (!updated) {
        throw new Error('Report not found.');
      }

      allowLeave();
      navigation.goBack();
    } catch (submitError) {
      console.error('Failed to update report:', submitError);
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Could not save changes. Please try again.';
      setError(message);
      Alert.alert('Could not save', message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !values) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <ScreenContainer padded>
        {loadedReport ? (
          <Text style={styles.reportNumber}>{loadedReport.reportNumber}</Text>
        ) : null}
        <ReportForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          saving={saving}
          error={error}
        />
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  reportNumber: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
});
