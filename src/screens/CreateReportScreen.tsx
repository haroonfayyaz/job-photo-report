import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { ReportForm, type ReportFormValues } from '../components/ReportForm';
import { ScreenContainer } from '../components/ScreenContainer';
import { getBusinessProfile } from '../data/repositories/businessProfileRepository';
import { createReport } from '../data/repositories/reportRepository';
import { toISODate } from '../domain/dates';
import { useUnsavedChangesGuard } from '../hooks/useUnsavedChangesGuard';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateReport'>;

function buildInitialValues(): ReportFormValues {
  const profile = getBusinessProfile();
  return {
    templateKey: 'general',
    title: '',
    customerName: '',
    siteAddress: '',
    jobReference: '',
    technicianName: profile.defaultTechnicianName,
    reportDate: toISODate(),
    generalNotes: '',
  };
}

export function CreateReportScreen({ navigation }: Props) {
  const initialValues = useMemo(() => buildInitialValues(), []);
  const [values, setValues] = useState<ReportFormValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [initialValues, values],
  );
  const allowLeave = useUnsavedChangesGuard(isDirty);

  const handleSubmit = () => {
    const trimmedName = values.customerName.trim();
    if (!trimmedName) {
      setError('Customer or site name is required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const report = createReport({
        templateKey: values.templateKey,
        title: values.title,
        customerName: trimmedName,
        siteAddress: values.siteAddress,
        jobReference: values.jobReference,
        technicianName: values.technicianName,
        reportDate: values.reportDate,
        generalNotes: values.generalNotes,
      });

      allowLeave();
      navigation.replace('ReportDetail', { reportId: report.id });
    } catch (submitError) {
      console.error('Failed to create report:', submitError);
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Could not create the report. Please try again.';
      setError(message);
      Alert.alert('Could not save', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <ScreenContainer padded style={styles.inner}>
        <ReportForm
          values={values}
          onChange={setValues}
          onSubmit={handleSubmit}
          submitLabel="Save & Open Report"
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
  inner: {
    paddingTop: 0,
  },
});
