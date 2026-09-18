import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { colors } from '../theme/colors';
import { minTouchTarget, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface FormFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
  hint?: string;
}

export function FormField({
  label,
  required,
  hint,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, inputProps.multiline && styles.multiline]}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.label,
    textTransform: 'none',
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.danger,
  },
  hint: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  input: {
    minHeight: minTouchTarget,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.text,
  },
  multiline: {
    minHeight: 112,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
});
