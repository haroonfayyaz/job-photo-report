import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppBootstrap } from './src/app/AppBootstrap';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppBootstrap />
    </SafeAreaProvider>
  );
}

export default App;
