import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AssetCategory } from '../../types';
import { CATEGORY_COLORS, CATEGORY_LABELS, COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';

interface Props {
  breakdown: Record<AssetCategory, number>;
  totalValue: number;
  selectedCategory: AssetCategory | null;
  onSelectCategory: (cat: AssetCategory | null) => void;
}

const CATEGORY_ORDER: AssetCategory[] = ['index-fund', 'etf', 'stock'];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export default function CategoryBreakdown({
  breakdown,
  totalValue,
  selectedCategory,
  onSelectCategory,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Category Breakdown</Text>
      {CATEGORY_ORDER.map((cat) => {
        const value = breakdown[cat];
        const pct = totalValue > 0 ? (value / totalValue) * 100 : 0;
        const isSelected = selectedCategory === cat;
        const color = CATEGORY_COLORS[cat];

        return (
          <TouchableOpacity
            key={cat}
            onPress={() => onSelectCategory(isSelected ? null : cat)}
            activeOpacity={0.7}
            style={[styles.row, isSelected && styles.rowSelected]}
          >
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={[styles.catLabel, isSelected && { color: color }]}>
                {CATEGORY_LABELS[cat]}
              </Text>
              <Text style={styles.valueText}>{formatCurrency(value)}</Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${pct}%`,
                    backgroundColor: isSelected ? color : `${color}80`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.pctText, { color: isSelected ? color : COLORS.textSecondary }]}>
              {pct.toFixed(1)}%
            </Text>
          </TouchableOpacity>
        );
      })}
      {selectedCategory && (
        <TouchableOpacity onPress={() => onSelectCategory(null)} style={styles.clearBtn}>
          <Text style={styles.clearText}>Clear filter</Text>
        </TouchableOpacity>
      )}
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
    marginBottom: 4,
  },
  row: {
    gap: 6,
    padding: SPACING.xs,
    borderRadius: RADIUS.badge,
  },
  rowSelected: {
    backgroundColor: COLORS.border,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catLabel: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  valueText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.regular,
  },
  barTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  pctText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    textAlign: 'right',
  },
  clearBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    marginTop: 4,
  },
  clearText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
