import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {EmptyState} from '../components/EmptyState';
import {ReportListItem} from '../components/ReportListItem';
import {colors, spacing} from '../constants/theme';
import type {ReportListItem as ReportListItemType} from '../models/types';
import type {RootStackParamList} from '../navigation/types';
import {listReports} from '../repositories/reportRepository';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function SettingsHeaderButton({onPress}: {onPress: () => void}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={styles.headerButton}>
      <Text style={styles.headerButtonText}>Settings</Text>
    </TouchableOpacity>
  );
}

export function homeScreenOptions({
  navigation,
}: {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}): NativeStackNavigationOptions {
  return {
    title: 'Job Photo Reports',
    headerRight: () => (
      <SettingsHeaderButton onPress={() => navigation.navigate('Settings')} />
    ),
  };
}

export function HomeScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [reports, setReports] = useState<ReportListItemType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(() => {
    try {
      const data = listReports();
      setReports(data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports]),
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={[
          styles.listContent,
          reports.length === 0 && styles.emptyList,
          {paddingBottom: insets.bottom + 80},
        ]}
        data={reports}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState
            title="No reports yet"
            message="Create your first job photo report in about a minute. Everything stays on this device."
            actionLabel="Create Report"
            onAction={() => navigation.navigate('CreateReport')}
          />
        }
        renderItem={({item}) => (
          <ReportListItem
            report={item}
            onPress={() =>
              navigation.navigate('ReportDetail', {reportId: item.id})
            }
          />
        )}
      />
      {reports.length > 0 ? (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => navigation.navigate('CreateReport')}
          style={[styles.fab, {bottom: insets.bottom + spacing.md}]}>
          <Text style={styles.fabText}>+ New Report</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.md,
  },
  emptyList: {
    flexGrow: 1,
  },
  headerButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  headerButtonText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    backgroundColor: colors.accent,
    borderRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
