import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { AssetCategory } from '../../types';
import { CATEGORY_COLORS, CATEGORY_LABELS, COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';

interface Props {
  breakdown: Record<AssetCategory, number>;
  totalValue: number;
}

const CATEGORY_ORDER: AssetCategory[] = ['index-fund', 'etf', 'stock'];

export default function PortfolioPieChart({ breakdown, totalValue }: Props) {
  const data = CATEGORY_ORDER
    .filter((cat) => breakdown[cat] > 0)
    .map((cat) => ({
      value: breakdown[cat],
      color: CATEGORY_COLORS[cat],
      text: `${((breakdown[cat] / totalValue) * 100).toFixed(0)}%`,
    }));

  if (totalValue === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Allocation</Text>
      <View style={styles.content}>
        <PieChart
          data={data}
          donut
          radius={70}
          innerRadius={44}
          centerLabelComponent={() => (
            <View style={styles.center}>
              <Text style={styles.centerText}>
                {data.length}
              </Text>
              <Text style={styles.centerSub}>types</Text>
            </View>
          )}
          showText
          textColor={COLORS.textPrimary}
          textSize={11}
          fontWeight="600"
          innerCircleColor={COLORS.surface}
          strokeWidth={2}
          strokeColor={COLORS.bg}
          isAnimated
          animationDuration={800}
        />
        <View style={styles.legend}>
          {CATEGORY_ORDER.map((cat) => {
            const value = breakdown[cat];
            if (value === 0) return null;
            const pct = ((value / totalValue) * 100).toFixed(1);
            return (
              <View key={cat} style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[cat] }]} />
                <View style={styles.legendText}>
                  <Text style={styles.legendLabel}>{CATEGORY_LABELS[cat]}</Text>
                  <Text style={[styles.legendPct, { color: CATEGORY_COLORS[cat] }]}>
                    {pct}%
                  </Text>
                </View>
              </View>
            );
          })}
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
    gap: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  center: {
    alignItems: 'center',
  },
  centerText: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
  },
  centerSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  legend: {
    flex: 1,
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
