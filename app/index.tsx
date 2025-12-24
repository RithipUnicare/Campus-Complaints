import * as React from 'react';
import AppNavigation from '../navigation/AppNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Entry() {
  return (
    <SafeAreaProvider>
      <AppNavigation />
    </SafeAreaProvider>
  );
}
