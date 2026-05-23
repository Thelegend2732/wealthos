import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AssetCategory } from '../../types';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SPACING,
} from '../../constants/theme';

interface Props {
  breakdown: Record<AssetCategory, number>;
  totalValue: number;
}

const CATEGORY_ORDER: AssetCategory[] = ['index-fund', 'etf', 'stock'];

/**
 * Custom horizontal stacked bar chart that mimics a pie-chart legend.
 * Pure View + flexbox — no SVG, no chart library, web-safe.
 */
export default function PortfolioPieChart({ breakdown, totalValue }: Props) {
  if (totalValue === 0) return null;

  const segments = CATEGORY_ORDER
    .filter((cat) => breakdown[cat] > 0)
    .map((cat) => ({
      cat,
      value: breakdown[cat],
      pct: (breakdown[cat] / totalValue) * 100,
      color: CATEGORY_COLORS[cat],
    }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Allocation</Text>

      {/* Stacked horizontal bar */}
      <View style={styles.barTrack}>
        {segments.map((s, idx) => (
          <View
            key={s.cat}
            style={[
              styles.barSegment,
              {
                flex: s.pct,
                backgroundColor: s.color,
                borderLeftWidth: idx === 0 ? 0 : 2,
                borderColor: COLORS.bg,
              },
            ]}
          />
        ))}
      </View>

      {/* Legend with percentages */}
      <View style={styles.legend}>
        {segments.map((s) => (
          <View key={s.cat} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <View style={styles.legendText}>
              <Text style={styles.legendLabel} numberOfLines={1}>
                {CATEGORY_LABELS[s.cat]}
              </Text>
              <Text style={[styles.legendPct, { color: s.color }]}>
                {s.pct.toFixed(1)}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  barTrack: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    backgroundColor: COLORS.border,
  },
  barSegment: {
    height: '100%',
  },
  legend: {
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.regular,
  },
  legendPct: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
