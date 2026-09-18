import { TextStyle } from 'react-native';

import { colors } from './colors';

export const typography = {
  display: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.5,
    color: colors.text,
  } satisfies TextStyle,
  title: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.3,
    color: colors.text,
  } satisfies TextStyle,
  heading: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.text,
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.text,
  } satisfies TextStyle,
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    color: colors.text,
  } satisfies TextStyle,
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.textSecondary,
  } satisfies TextStyle,
  label: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  } satisfies TextStyle,
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.1,
    color: colors.onPrimary,
  } satisfies TextStyle,
} as const;
