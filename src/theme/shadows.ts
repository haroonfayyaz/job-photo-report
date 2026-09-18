import { Platform, ViewStyle } from 'react-native';

import { colors } from './colors';

type ShadowSize = 'sm' | 'md' | 'lg';

const shadowMap: Record<ShadowSize, ViewStyle> = {
  sm: Platform.select({
    ios: {
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
    default: {},
  }) as ViewStyle,
  md: Platform.select({
    ios: {
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }) as ViewStyle,
  lg: Platform.select({
    ios: {
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
    },
    android: { elevation: 8 },
    default: {},
  }) as ViewStyle,
};

export function shadow(size: ShadowSize): ViewStyle {
  return shadowMap[size];
}
