import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {Button} from '../components/Button';
import {FormField} from '../components/FormField';
import {REPORT_TYPES, REPORT_TYPE_LABELS} from '../constants/reportTypes';
import {colors, spacing} from '../constants/theme';
import type {ReportType} from '../models/types';
import type {RootStackParamList} from '../navigation/types';
import {createReport} from '../repositories/reportRepository';
import {getBusinessProfile} from '../repositories/settingsRepository';
import {ensureReportMediaDirectories} from '../services/fileStorageService';
import {toISODate} from '../utils/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateReport'>;

export function CreateReportScreen({navigation}: Props) {
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [reportType, setReportType] = useState<ReportType>('general');
  const [generalNotes, setGeneralNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const profile = getBusinessProfile();
    if (profile.defaultTechnicianName) {
      setTechnicianName(profile.defaultTechnicianName);
    }
  }, []);

  const handleCreate = async () => {
    const trimmedName = customerName.trim();
    if (!trimmedName) {
      Alert.alert('Required', 'Please enter a customer or site name.');
      return;
    }

    setSaving(true);
    try {
      const report = createReport({
        customerName: trimmedName,
        address,
        referenceNumber,
        technicianName,
        reportType,
        generalNotes,
        reportDate: toISODate(),
      });

      await ensureReportMediaDirectories(report.id);

      navigation.replace('ReportDetail', {reportId: report.id});
    } catch (error) {
      console.error('Failed to create report:', error);
      Alert.alert('Error', 'Could not create the report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>
          Enter the basics now. You can add photos and sections on the next
          screen.
        </Text>

        <FormField
          label="Customer / Site Name"
          required
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="e.g. Smith Residence"
          autoFocus
        />
        <FormField
          label="Address / Location"
          value={address}
          onChangeText={setAddress}
          placeholder="Street, city"
        />
        <FormField
          label="Reference / Job Number"
          value={referenceNumber}
          onChangeText={setReferenceNumber}
          placeholder="Optional"
        />
        <FormField
          label="Technician / Inspector"
          value={technicianName}
          onChangeText={setTechnicianName}
          placeholder="Your name"
        />

        <Text style={styles.sectionLabel}>Report Type</Text>
        <View style={styles.chipRow}>
          {REPORT_TYPES.map(type => (
            <Button
              key={type}
              label={REPORT_TYPE_LABELS[type]}
              variant={reportType === type ? 'primary' : 'secondary'}
              onPress={() => setReportType(type)}
              style={styles.chip}
            />
          ))}
        </View>

        <FormField
          label="General Notes"
          value={generalNotes}
          onChangeText={setGeneralNotes}
          placeholder="Optional notes for this job"
          multiline
        />

        <Button
          label={saving ? 'Creating...' : 'Create Report'}
          disabled={saving}
          onPress={handleCreate}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  hint: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
  },
});
