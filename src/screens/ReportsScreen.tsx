import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { IconBadge } from '../components/IconBadge';
import { ReportListItem } from '../components/ReportListItem';
import { ScreenContainer } from '../components/ScreenContainer';
import { listReportSummaries } from '../data/repositories/reportRepository';
import type { ReportSummary } from '../domain/models';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadow } from '../theme/shadows';
import { minTouchTarget, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Reports'>;

export function ReportsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(() => {
    try {
      setError(null);
      setReports(listReportSummaries());
    } catch (loadError) {
      console.error('Failed to load reports:', loadError);
      setError('Could not load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadReports();
    }, [loadReports]),
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.navigate('Settings')}
          style={styles.headerButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.headerButtonText}>Settings</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <ScreenContainer style={styles.centeredContent}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <Button label="Retry" onPress={loadReports} />
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        contentContainerStyle={[
          styles.listContent,
          reports.length === 0 && styles.emptyList,
          { paddingBottom: insets.bottom + 88 },
        ]}
        data={reports}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconBadge symbol="📋" variant="primary" />
            <Text style={typography.heading}>Create your first photo report</Text>
            <Text style={styles.emptyMessage}>
              Build a report in about a minute. Everything stays on your device —
              no internet needed.
            </Text>
            <Button
              label="New Report"
              onPress={() => navigation.navigate('CreateReport')}
              style={styles.emptyButton}
            />
          </View>
        }
        renderItem={({ item }) => (
          <ReportListItem
            report={item}
            onPress={() =>
              navigation.navigate('ReportDetail', { reportId: item.id })
            }
          />
        )}
        refreshing={loading}
        onRefresh={loadReports}
      />

      {reports.length > 0 ? (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.navigate('CreateReport')}
          style={[styles.fab, { bottom: insets.bottom + spacing.md }]}>
          <Text style={styles.fabText}>+ New Report</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  listContent: {
    padding: spacing.md,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 200,
    marginTop: spacing.sm,
  },
  errorTitle: {
    ...typography.heading,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    ...shadow('md'),
  },
  fabText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  headerButton: {
    marginRight: spacing.sm,
    minHeight: minTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
  },
  headerButtonText: {
    ...typography.bodyBold,
    color: colors.primary,
    fontSize: 14,
  },
});
