import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Asset, PriceData } from '../../types';
import { CATEGORY_COLORS, CATEGORY_LABELS, COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';

interface Props {
  asset: Asset;
  priceData?: PriceData & { isDelayed?: boolean };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export default function AssetCard({ asset, priceData }: Props) {
  const currentValue = asset.currentPrice * asset.quantity;
  const investedValue = asset.avgPrice * asset.quantity;
  const pnlAmount = currentValue - investedValue;
  const pnlPercent = investedValue > 0 ? (pnlAmount / investedValue) * 100 : 0;
  const isPnlPositive = pnlAmount >= 0;

  const dayChange = priceData?.changePercent ?? 0;
  const isDayPositive = dayChange >= 0;
  const categoryColor = CATEGORY_COLORS[asset.category];

  return (
    <View style={styles.card}>
      {/* Left: symbol + name */}
      <View style={styles.left}>
        <View style={styles.symbolRow}>
          <Text style={styles.symbol}>{asset.symbol}</Text>
          {priceData?.isDelayed && (
            <View style={styles.delayedBadge}>
              <Text style={styles.delayedText}>DELAYED</Text>
            </View>
          )}
        </View>
        <Text style={styles.name} numberOfLines={1}>{asset.name}</Text>
        <View style={styles.metaRow}>
          <View style={[styles.catBadge, { backgroundColor: `${categoryColor}20` }]}>
            <Text style={[styles.catText, { color: categoryColor }]}>
              {CATEGORY_LABELS[asset.category]}
            </Text>
          </View>
          <Text style={styles.shares}>{asset.quantity} shares</Text>
        </View>
      </View>

      {/* Right: price + P&L */}
      <View style={styles.right}>
        <Text style={styles.price}>{formatCurrency(asset.currentPrice)}</Text>
        <View style={[
          styles.changeBadge,
          { backgroundColor: isDayPositive ? `${COLORS.success}18` : `${COLORS.danger}18` }
        ]}>
          <Text style={[styles.changeText, { color: isDayPositive ? COLORS.success : COLORS.danger }]}>
            {isDayPositive ? '▲' : '▼'} {formatPercent(dayChange)}
          </Text>
        </View>

        <View style={styles.pnlRow}>
          <Text style={[styles.pnlAmount, { color: isPnlPositive ? COLORS.success : COLORS.danger }]}>
            {isPnlPositive ? '+' : ''}{formatCurrency(pnlAmount)}
          </Text>
          <Text style={[styles.pnlPct, { color: isPnlPositive ? COLORS.success : COLORS.danger }]}>
            {formatPercent(pnlPercent)}
          </Text>
        </View>
        <Text style={styles.positionValue}>{formatCurrency(currentValue)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  left: {
    flex: 1,
    gap: 4,
    paddingRight: SPACING.sm,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  symbol: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
  },
  delayedBadge: {
    backgroundColor: `${COLORS.accent}20`,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  delayedText: {
    fontSize: 9,
    color: COLORS.accent,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.regular,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: 2,
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.badge,
  },
  catText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
  shares: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  price: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
  },
  changeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: RADIUS.badge,
  },
  changeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
  pnlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pnlAmount: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  pnlPct: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.regular,
  },
  positionValue: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.regular,
  },
});
