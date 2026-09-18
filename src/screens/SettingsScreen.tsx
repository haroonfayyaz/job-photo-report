import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import {Button} from '../components/Button';
import {FormField} from '../components/FormField';
import {colors, spacing} from '../constants/theme';
import type {BusinessProfile} from '../models/types';
import type {RootStackParamList} from '../navigation/types';
import {
  getBusinessProfile,
  saveBusinessProfile,
} from '../repositories/settingsRepository';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({navigation}: Props) {
  const [profile, setProfile] = useState<BusinessProfile>({
    companyName: '',
    logoPath: null,
    phone: '',
    email: '',
    website: '',
    address: '',
    defaultTechnicianName: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProfile(getBusinessProfile());
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      saveBusinessProfile(profile);
      Alert.alert('Saved', 'Business profile updated.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Could not save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BusinessProfile, value: string) => {
    setProfile(current => ({...current, [field]: value}));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>
          This information appears on generated PDF reports. Logo upload will be
          added in a later step.
        </Text>

        <FormField
          label="Company Name"
          value={profile.companyName}
          onChangeText={value => updateField('companyName', value)}
          placeholder="Your business name"
        />
        <FormField
          label="Phone"
          value={profile.phone}
          onChangeText={value => updateField('phone', value)}
          placeholder="+1 555 000 0000"
          keyboardType="phone-pad"
        />
        <FormField
          label="Email"
          value={profile.email}
          onChangeText={value => updateField('email', value)}
          placeholder="contact@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormField
          label="Website"
          value={profile.website}
          onChangeText={value => updateField('website', value)}
          placeholder="https://company.com"
          autoCapitalize="none"
        />
        <FormField
          label="Business Address"
          value={profile.address}
          onChangeText={value => updateField('address', value)}
          placeholder="Company address"
          multiline
        />
        <FormField
          label="Default Technician Name"
          value={profile.defaultTechnicianName}
          onChangeText={value => updateField('defaultTechnicianName', value)}
          placeholder="Pre-fills new reports"
        />

        <Button
          label={saving ? 'Saving...' : 'Save Profile'}
          disabled={saving}
          onPress={handleSave}
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
});
