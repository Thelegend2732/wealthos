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

// On web: plain View — gesture-handler's GestureHandlerRootView is a
// no-op in the browser and importing it pulls react-native-reanimated
// → react-native-worklets-core which has no web build.
// On native: lazy-require so the web bundle never touches it.
function RootWrapper({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') {
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
          <StatusBar style="light" backgroundColor="#0A0A0F" />
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </RootWrapper>
  );
}
