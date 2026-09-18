import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import {colors} from '../constants/theme';
import {CreateReportScreen} from '../screens/CreateReportScreen';
import {HomeScreen} from '../screens/HomeScreen';
import {ReportDetailScreen} from '../screens/ReportDetailScreen';
import {SettingsScreen} from '../screens/SettingsScreen';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {backgroundColor: colors.primary},
          headerTintColor: colors.surface,
          headerTitleStyle: {fontWeight: '600'},
          contentStyle: {backgroundColor: colors.background},
        }}>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Job Photo Reports'}}
        />
        <Stack.Screen
          name="CreateReport"
          component={CreateReportScreen}
          options={{title: 'New Report'}}
        />
        <Stack.Screen
          name="ReportDetail"
          component={ReportDetailScreen}
          options={{title: 'Report'}}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{title: 'Business Profile'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
