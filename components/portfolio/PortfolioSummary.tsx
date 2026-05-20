import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';

interface Props {
  totalValue: number;
  totalInvested: number;
  pnl: { amount: number; percentage: number };
  todayChange: { amount: number; percentage: number };
  isLoading: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function SkeletonBox({ width, height }: { width: number | string; height: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius: 6, backgroundColor: COLORS.border },
        { opacity },
      ]}
    />
  );
}

export default function PortfolioSummary({
  totalValue,
  totalInvested,
  pnl,
  todayChange,
  isLoading,
}: Props) {
  const isPnLPositive = pnl.amount >= 0;
  const isTodayPositive = todayChange.amount >= 0;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Total Portfolio Value</Text>
      {isLoading ? (
        <SkeletonBox width={220} height={42} />
      ) : (
        <Text style={styles.totalValue}>{formatCurrency(totalValue)}</Text>
      )}

      <View style={styles.row}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Invested</Text>
          {isLoading ? (
            <SkeletonBox width={90} height={18} />
          ) : (
            <Text style={styles.metaValue}>{formatCurrency(totalInvested)}</Text>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Total P&L</Text>
          {isLoading ? (
            <SkeletonBox width={100} height={18} />
          ) : (
            <View style={styles.pnlRow}>
              <Text style={[styles.pnlValue, { color: isPnLPositive ? COLORS.success : COLORS.danger }]}>
                {isPnLPositive ? '+' : ''}{formatCurrency(pnl.amount)}
              </Text>
              <View style={[styles.badge, { backgroundColor: isPnLPositive ? `${COLORS.success}20` : `${COLORS.danger}20` }]}>
                <Text style={[styles.badgeText, { color: isPnLPositive ? COLORS.success : COLORS.danger }]}>
                  {formatPercent(pnl.percentage)}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Today</Text>
          {isLoading ? (
            <SkeletonBox width={90} height={18} />
          ) : (
            <View style={styles.pnlRow}>
              <Text style={[styles.pnlValue, { color: isTodayPositive ? COLORS.success : COLORS.danger }]}>
                {isTodayPositive ? '+' : ''}{formatCurrency(todayChange.amount)}
              </Text>
              <View style={[styles.badge, { backgroundColor: isTodayPositive ? `${COLORS.success}20` : `${COLORS.danger}20` }]}>
                <Text style={[styles.badgeText, { color: isTodayPositive ? COLORS.success : COLORS.danger }]}>
                  {formatPercent(todayChange.percentage)}
                </Text>
              </View>
            </View>
          )}
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
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.regular,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: FONT_SIZE.xxxl,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: -1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  metaItem: {
    flex: 1,
    gap: 4,
  },
  metaLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  pnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  pnlValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: RADIUS.badge,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    alignSelf: 'stretch',
  },
});
