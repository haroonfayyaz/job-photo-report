import React from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { screenStyles } from '../theme/screenStyles';
import { spacing } from '../theme/spacing';

interface ScreenContainerProps extends ViewProps {
  scroll?: boolean;
  padded?: boolean;
}

export function ScreenContainer({
  children,
  scroll = false,
  padded = true,
  style,
  ...props
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const contentStyle = [
    padded && styles.padded,
    { paddingBottom: Math.max(insets.bottom, spacing.lg) },
    style,
  ];

  if (scroll) {
    return (
      <ScrollView
        style={screenStyles.screen}
        contentContainerStyle={[contentStyle, styles.scrollContent]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        {...props}>
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[screenStyles.screen, contentStyle]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
