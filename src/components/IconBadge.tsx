import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '../theme/colors';
import { radius } from '../theme/radius';

type IconBadgeVariant = 'primary' | 'accent' | 'muted';

interface IconBadgeProps {
  symbol: string;
  variant?: IconBadgeVariant;
  size?: 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<
  IconBadgeVariant,
  { background: string; foreground: string }
> = {
  primary: { background: colors.primarySoft, foreground: colors.primary },
  accent: { background: colors.accentSoft, foreground: colors.accent },
  muted: { background: colors.surfaceMuted, foreground: colors.textSecondary },
};

export function IconBadge({
  symbol,
  variant = 'primary',
  size = 'lg',
  style,
}: IconBadgeProps) {
  const palette = variantStyles[variant];
  const isLarge = size === 'lg';

  return (
    <View
      style={[
        styles.base,
        isLarge ? styles.large : styles.medium,
        { backgroundColor: palette.background },
        style,
      ]}>
      <Text
        style={[
          styles.symbol,
          isLarge ? styles.symbolLarge : styles.symbolMedium,
          { color: palette.foreground },
        ]}>
        {symbol}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.xl,
  },
  large: {
    width: 64,
    height: 64,
  },
  medium: {
    width: 48,
    height: 48,
  },
  symbol: {
    fontWeight: '600',
  },
  symbolLarge: {
    fontSize: 28,
  },
  symbolMedium: {
    fontSize: 20,
  },
});
