import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { initializeDatabase } from '../data';
import { localFileService } from '../data/services/localFileService';
import { RootNavigator } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function AppBootstrap() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        initializeDatabase();
        await localFileService.ensureAppDirectories();
        setReady(true);
      } catch (bootstrapError) {
        console.error('Database initialization failed:', bootstrapError);
        setError('Failed to initialize local storage. Please restart the app.');
      }
    };

    bootstrap().catch(() => undefined);
  }, []);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Startup Error</Text>
        <Text style={styles.errorMessage}>{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <RootNavigator />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.caption,
  },
  errorTitle: {
    ...typography.heading,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
