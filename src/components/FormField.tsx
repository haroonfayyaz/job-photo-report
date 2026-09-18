import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import {colors, spacing} from '../constants/theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  required?: boolean;
}

export function FormField({label, required, ...inputProps}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        placeholderTextColor={colors.textSecondary}
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
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.danger,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: 16,
    color: colors.text,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
