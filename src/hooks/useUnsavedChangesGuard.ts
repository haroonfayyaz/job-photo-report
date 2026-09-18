import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';

/**
 * Blocks back navigation while the form is dirty.
 * Call the returned `allowLeave()` immediately before programmatic navigation
 * after a successful save — state updates are async and won't apply in time.
 */
export function useUnsavedChangesGuard(isDirty: boolean): () => void {
  const navigation = useNavigation();
  const allowLeaveRef = useRef(false);

  useEffect(() => {
    allowLeaveRef.current = false;
  }, [isDirty]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', event => {
      if (!isDirty || allowLeaveRef.current) {
        return;
      }

      event.preventDefault();
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes that will be lost.',
        [
          { text: 'Keep editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(event.data.action),
          },
        ],
      );
    });

    return unsubscribe;
  }, [isDirty, navigation]);

  return useCallback(() => {
    allowLeaveRef.current = true;
  }, []);
}
