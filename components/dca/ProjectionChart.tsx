import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { ProjectionPoint } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - SPACING.md * 2 - 32;

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

export default function ProjectionChart({ projections, currency }: Props) {
  const yearlyData = useMemo(
    () => projections.filter((_, i) => i % 12 === 11 || i === projections.length - 1),
    [projections]
  );

  const conservativeData = yearlyData.map((p, i) => ({
    value: p.conservative,
    label: i % 5 === 4 || i === 0 ? `Y${Math.floor(p.month / 12)}` : '',
  }));

  const moderateData = yearlyData.map((p) => ({ value: p.moderate }));
  const optimisticData = yearlyData.map((p) => ({ value: p.optimistic }));
  const contributedData = yearlyData.map((p) => ({ value: p.totalContributed }));

  const maxValue = Math.max(...yearlyData.map((p) => p.optimistic));

  if (yearlyData.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Growth Projection</Text>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: COLORS.success }]} />
          <Text style={styles.legendLabel}>Optimistic (15%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendLabel}>Moderate (10%)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: COLORS.textMuted, borderStyle: 'dashed' }]} />
          <Text style={styles.legendLabel}>Conservative (6%)</Text>
        </View>
      </View>

      <LineChart
        data={moderateData}
        data2={optimisticData}
        data3={conservativeData}
        data4={contributedData}
        width={CHART_WIDTH}
        height={200}
        spacing={CHART_WIDTH / Math.max(yearlyData.length - 1, 1)}
        maxValue={maxValue * 1.05}
        noOfSections={4}
        color1={COLORS.primary}
        color2={COLORS.success}
        color3={COLORS.textMuted}
        color4={COLORS.border}
        thickness={2}
        thickness2={2}
        thickness3={1.5}
        thickness4={1}
        curved
        hideDataPoints
        hideDataPoints2
        hideDataPoints3
        hideDataPoints4
        areaChart
        startFillColor1={`${COLORS.primary}30`}
        endFillColor1={`${COLORS.primary}00`}
        startOpacity1={0.8}
        endOpacity1={0}
        startFillColor2={`${COLORS.success}20`}
        endFillColor2={`${COLORS.success}00`}
        startOpacity2={0.4}
        endOpacity2={0}
        backgroundColor="transparent"
        xAxisColor={COLORS.border}
        yAxisColor="transparent"
        xAxisLabelTextStyle={{ color: COLORS.textMuted, fontSize: 10 }}
        yAxisTextStyle={{ color: COLORS.textMuted, fontSize: 10 }}
        formatYLabel={(val) => formatValue(parseFloat(val), currency)}
        isAnimated
        animationDuration={600}
        rulesColor={COLORS.border}
        rulesType="solid"
      />
    </View>
  );
}

// Fallback for when @react-native-community/slider is missing — inline TextInput substitute
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    gap: SPACING.md,
    overflow: 'hidden',
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
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
  },
  legendLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
});
