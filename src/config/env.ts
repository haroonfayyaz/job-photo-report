/**
 * Environment-safe app configuration.
 * Keep secrets out of source control; use native build config for production values.
 */
export const env = {
  appName: 'Job Photo Report',
  isDev: __DEV__,
} as const;
