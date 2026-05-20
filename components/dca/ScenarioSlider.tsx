import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProjectionPoint } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';

interface Props {
  finalPoint: ProjectionPoint | undefined;
  currency: 'USD' | 'EUR';
  initialCapital: number;
  monthlyContribution: number;
  years: number;
}

function formatCurrency(value: number, currency: 'USD' | 'EUR'): string {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'de-DE', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

interface SummaryCardProps {
  label: string;
  value: string;
  color?: string;
  subtitle?: string;
}

function SummaryCard({ label, value, color, subtitle }: SummaryCardProps) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, color ? { color } : {}]}>{value}</Text>
      {subtitle && <Text style={styles.summarySubtitle}>{subtitle}</Text>}
    </View>
  );
}

export default function ScenarioSlider({
  finalPoint,
  currency,
  initialCapital,
  monthlyContribution,
  years,
}: Props) {
  if (!finalPoint) return null;

  const totalMonths = years * 12;
  const totalContributed = initialCapital + monthlyContribution * totalMonths;
  const moderate = finalPoint.moderate;
  const interestGenerated = moderate - totalContributed;
  const multiplier = totalContributed > 0 ? moderate / totalContributed : 1;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Moderate Scenario (10% annual)</Text>
      <View style={styles.grid}>
        <SummaryCard
          label="Final Value"
          value={formatCurrency(moderate, currency)}
          color={COLORS.success}
        />
        <SummaryCard
          label="Total Contributed"
          value={formatCurrency(totalContributed, currency)}
        />
        <SummaryCard
          label="Interest Generated"
          value={formatCurrency(interestGenerated, currency)}
          color={COLORS.primary}
        />
        <SummaryCard
          label="Money Multiplier"
          value={`${multiplier.toFixed(1)}x`}
          color={COLORS.accent}
          subtitle="Your money worked this times harder"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryValue: {
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: -0.5,
  },
  summarySubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
});
