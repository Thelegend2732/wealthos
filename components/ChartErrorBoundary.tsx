import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../constants/theme';

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  hasError: boolean;
}

/**
 * Wraps chart components so a render failure (e.g. SVG engine not yet ready
 * on web) shows a friendly placeholder instead of crashing the whole screen.
 */
export class ChartErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.icon}>📊</Text>
          <Text style={styles.label}>{this.props.fallbackLabel ?? 'Chart unavailable'}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    marginHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  icon: { fontSize: 36 },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
