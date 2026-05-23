import React, { Component, ReactNode } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  info: string;
}

/**
 * Catches ANY render error in the app and displays it visibly on screen.
 * Without this, Expo's renderRootComponent silently renders an empty View
 * on error, producing the dreaded "blank white page".
 */
export class TopLevelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, info: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, info: '' };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string | null }) {
    this.setState({ info: errorInfo.componentStack ?? '' });
    // eslint-disable-next-line no-console
    console.error('[WealthOS top-level error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ScrollView style={styles.root} contentContainerStyle={styles.content}>
          <Text style={styles.title}>WealthOS — Render error</Text>
          <Text style={styles.subtitle}>
            The app crashed while mounting. Details below — open DevTools console for full trace.
          </Text>
          <View style={styles.card}>
            <Text style={styles.label}>Error</Text>
            <Text style={styles.error}>{this.state.error.name}: {this.state.error.message}</Text>
          </View>
          {this.state.error.stack && (
            <View style={styles.card}>
              <Text style={styles.label}>Stack</Text>
              <Text style={styles.stack}>{this.state.error.stack}</Text>
            </View>
          )}
          {this.state.info && (
            <View style={styles.card}>
              <Text style={styles.label}>Component stack</Text>
              <Text style={styles.stack}>{this.state.info}</Text>
            </View>
          )}
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0F' },
  content: { padding: 24, gap: 16 },
  title: { color: '#FF4757', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#8B8FA8', fontSize: 14, lineHeight: 20 },
  card: {
    backgroundColor: '#13131A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E1E2E',
    gap: 6,
  },
  label: {
    color: '#8B8FA8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  error: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  stack: { color: '#8B8FA8', fontSize: 11, fontFamily: 'monospace', lineHeight: 16 },
});
