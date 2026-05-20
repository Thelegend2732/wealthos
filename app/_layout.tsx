import '../global.css';
import React from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// GestureHandlerRootView is only needed on native (iOS / Android).
// On web, react-native-gesture-handler uses DOM events directly and
// the wrapper component is a no-op — but importing the native module
// pulls in react-native-reanimated → react-native-worklets-core which
// has no web implementation and crashes the Metro web bundle.
function RootWrapper({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') {
    // Lazy-require so the web bundle never touches gesture-handler's
    // native reanimated bindings during the import phase.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { GestureHandlerRootView } = require('react-native-gesture-handler');
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        {children}
      </GestureHandlerRootView>
    );
  }
  return <View style={{ flex: 1 }}>{children}</View>;
}

export default function RootLayout() {
  return (
    <RootWrapper>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </RootWrapper>
  );
}
