import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProjectionPoint } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';

interface Props {
  projections: ProjectionPoint[];
  currency: 'USD' | 'EUR';
}

function formatValue(value: number, currency: 'USD' | 'EUR'): string {
  const symbol = currency === 'USD' ? '$' : '€';
  if (value >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(0)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

/**
 * Pure View + flexbox column-bar chart. No SVG, no chart library.
 * Shows the three scenarios side by side per year, scaled to the
 * optimistic max so the bars are visually comparable.
 */
export default function ProjectionChart({ projections, currency }: Props) {
  const yearlyData = useMemo(
    () => projections.filter((_, i) => i % 12 === 11 || i === projections.length - 1),
    [projections]
  );

  if (yearlyData.length === 0) return null;

  const maxValue = Math.max(...yearlyData.map((p) => p.optimistic));
  // Show at most 10 evenly-spaced years to keep the chart readable.
  const stride = Math.max(1, Math.ceil(yearlyData.length / 10));
  const sampled = yearlyData.filter((_, i) => i % stride === 0 || i === yearlyData.length - 1);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Growth Projection</Text>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
          <Text style={styles.legendLabel}>Optimistic (15%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendLabel}>Moderate (10%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.textMuted }]} />
          <Text style={styles.legendLabel}>Conservative (6%)</Text>
        </View>
      </View>

      {/* Chart */}
      <View style={styles.chartArea}>
        {sampled.map((point) => {
          const year = Math.floor(point.month / 12);
          const heights = {
            optimistic: (point.optimistic / maxValue) * 100,
            moderate: (point.moderate / maxValue) * 100,
            conservative: (point.conservative / maxValue) * 100,
          };
          return (
            <View key={point.month} style={styles.column}>
              <View style={styles.bars}>
                <View
                  style={[
                    styles.bar,
                    { height: `${heights.optimistic}%`, backgroundColor: COLORS.success },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    { height: `${heights.moderate}%`, backgroundColor: COLORS.primary },
                  ]}
                />
                <View
                  style={[
                    styles.bar,
                    { height: `${heights.conservative}%`, backgroundColor: COLORS.textMuted },
                  ]}
                />
              </View>
              <Text style={styles.xLabel}>Y{year}</Text>
            </View>
          );
        })}
      </View>

      {/* Final values */}
      <View style={styles.finalRow}>
        <View style={styles.finalItem}>
          <Text style={styles.finalLabel}>Conservative</Text>
          <Text style={[styles.finalValue, { color: COLORS.textMuted }]}>
            {formatValue(yearlyData[yearlyData.length - 1].conservative, currency)}
          </Text>
        </View>
        <View style={styles.finalItem}>
          <Text style={styles.finalLabel}>Moderate</Text>
          <Text style={[styles.finalValue, { color: COLORS.primary }]}>
            {formatValue(yearlyData[yearlyData.length - 1].moderate, currency)}
          </Text>
        </View>
        <View style={styles.finalItem}>
          <Text style={styles.finalLabel}>Optimistic</Text>
          <Text style={[styles.finalValue, { color: COLORS.success }]}>
            {formatValue(yearlyData[yearlyData.length - 1].optimistic, currency)}
          </Text>
        </View>
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
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    gap: 6,
    paddingTop: SPACING.sm,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    gap: 2,
    width: '100%',
  },
  bar: {
    flex: 1,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    minHeight: 2,
  },
  xLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.semibold,
  },
  finalRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  finalItem: {
    flex: 1,
    gap: 2,
  },
  finalLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  finalValue: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
  },
});
