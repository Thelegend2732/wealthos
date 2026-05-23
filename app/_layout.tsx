import React from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TopLevelErrorBoundary } from '../components/TopLevelErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Using <Slot /> instead of <Stack /> deliberately:
// • <Stack /> pulls in @react-navigation/native-stack which depends on
//   react-native-reanimated transitively. Without reanimated installed,
//   the Stack initializer crashes silently → blank page.
// • <Slot /> is the minimal Expo Router primitive — it just renders the
//   matched route. No native navigators, no animations, no reanimated.
export default function RootLayout() {
  return (
    <TopLevelErrorBoundary>
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="light" />
            <Slot />
          </QueryClientProvider>
        </SafeAreaProvider>
      </View>
    </TopLevelErrorBoundary>
  );
}
