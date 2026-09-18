import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { TEMPLATE_LABELS } from '../constants/templateLabels';
import { TEMPLATE_KEYS, type TemplateKey } from '../domain/enums';
import { Button } from './Button';
import { FormField } from './FormField';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export interface ReportFormValues {
  templateKey: TemplateKey;
  title: string;
  customerName: string;
  siteAddress: string;
  jobReference: string;
  technicianName: string;
  reportDate: string;
  generalNotes: string;
}

interface ReportFormProps {
  values: ReportFormValues;
  onChange: (values: ReportFormValues) => void;
  onSubmit: () => void;
  submitLabel: string;
  saving?: boolean;
  error?: string | null;
}

export function ReportForm({
  values,
  onChange,
  onSubmit,
  submitLabel,
  saving = false,
  error,
}: ReportFormProps) {
  const setField = <K extends keyof ReportFormValues>(
    key: K,
    value: ReportFormValues[K],
  ) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionLabel}>Report type</Text>
      <View style={styles.chipRow}>
        {TEMPLATE_KEYS.map(key => (
          <Button
            key={key}
            label={TEMPLATE_LABELS[key]}
            variant={values.templateKey === key ? 'primary' : 'secondary'}
            onPress={() => setField('templateKey', key)}
            style={styles.chip}
          />
        ))}
      </View>

      <FormField
        label="Report title"
        value={values.title}
        onChangeText={text => setField('title', text)}
        placeholder="Optional — defaults to customer/site name"
      />
      <FormField
        label="Customer / site name"
        required
        value={values.customerName}
        onChangeText={text => setField('customerName', text)}
        placeholder="e.g. Smith Residence"
        autoCapitalize="words"
      />
      <FormField
        label="Site address"
        value={values.siteAddress}
        onChangeText={text => setField('siteAddress', text)}
        placeholder="Street, city"
      />
      <FormField
        label="Job / reference number"
        value={values.jobReference}
        onChangeText={text => setField('jobReference', text)}
        placeholder="Optional"
        autoCapitalize="characters"
      />
      <FormField
        label="Technician / inspector"
        value={values.technicianName}
        onChangeText={text => setField('technicianName', text)}
        placeholder="Your name"
      />
      <FormField
        label="Report date"
        value={values.reportDate}
        onChangeText={text => setField('reportDate', text)}
        placeholder="YYYY-MM-DD"
        autoCapitalize="none"
      />
      <FormField
        label="General notes"
        value={values.generalNotes}
        onChangeText={text => setField('generalNotes', text)}
        placeholder="Optional notes for this job"
        multiline
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={saving ? 'Saving...' : submitLabel}
        disabled={saving}
        onPress={onSubmit}
        style={styles.submit}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.label,
    textTransform: 'none',
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
  submit: {
    marginTop: spacing.sm,
  },
});
