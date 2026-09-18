import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

import {colors, spacing} from '../constants/theme';
import {initializeDatabase} from '../db/database';
import {RootNavigator} from '../navigation/RootNavigator';
import {ensureStorageDirectories} from '../services/fileStorageService';

export function AppBootstrap() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await initializeDatabase();
        await ensureStorageDirectories();
        if (!cancelled) {
          setReady(true);
        }
      } catch (bootstrapError) {
        console.error('App bootstrap failed:', bootstrapError);
        if (!cancelled) {
          setError('Failed to initialize local storage. Please restart the app.');
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
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
    color: colors.textSecondary,
    fontSize: 15,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
