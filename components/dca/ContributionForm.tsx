import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';

interface Props {
  initialCapital: number;
  monthlyContribution: number;
  years: number;
  currency: 'USD' | 'EUR';
  onCapitalChange: (value: number) => void;
  onContributionChange: (value: number) => void;
  onYearsChange: (value: number) => void;
  onCurrencyToggle: () => void;
}

const SYMBOL = { USD: '$', EUR: '€' };

// Web slider — native HTML <input type="range">
function WebSlider({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  // Use createElement to render a real DOM <input> without TS JSX errors
  return React.createElement('input', {
    type: 'range',
    min,
    max,
    step,
    value,
    onChange: (e: { target: { value: string } }) =>
      onChange(Number(e.target.value)),
    style: {
      width: '100%',
      height: 40,
      accentColor: COLORS.primary,
      cursor: 'pointer',
      background: 'transparent',
    },
  });
}

// Native fallback — stepper buttons (no dependency on community slider)
function NativeStepper({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.stepperRow}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - step))}
        style={({ pressed }) => [styles.stepBtn, pressed && styles.stepBtnPressed]}
      >
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${((value - min) / (max - min)) * 100}%` },
          ]}
        />
      </View>
      <Pressable
        onPress={() => onChange(Math.min(max, value + step))}
        style={({ pressed }) => [styles.stepBtn, pressed && styles.stepBtnPressed]}
      >
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

export default function ContributionForm({
  initialCapital,
  monthlyContribution,
  years,
  currency,
  onCapitalChange,
  onContributionChange,
  onYearsChange,
  onCurrencyToggle,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>Configuration</Text>
        <TouchableOpacity onPress={onCurrencyToggle} style={styles.currencyToggle}>
          <Text style={styles.currencyText}>
            {currency === 'USD' ? '🇺🇸 USD' : '🇪🇺 EUR'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Initial Capital</Text>
        <View style={styles.inputRow}>
          <Text style={styles.currencySymbol}>{SYMBOL[currency]}</Text>
          <TextInput
            style={styles.input}
            value={initialCapital.toString()}
            onChangeText={(t) => {
              const n = parseFloat(t.replace(/[^0-9.]/g, ''));
              if (!isNaN(n)) onCapitalChange(n);
            }}
            keyboardType="numeric"
            placeholderTextColor={COLORS.textMuted}
            selectionColor={COLORS.primary}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Monthly Contribution</Text>
        <View style={styles.inputRow}>
          <Text style={styles.currencySymbol}>{SYMBOL[currency]}</Text>
          <TextInput
            style={styles.input}
            value={monthlyContribution.toString()}
            onChangeText={(t) => {
              const n = parseFloat(t.replace(/[^0-9.]/g, ''));
              if (!isNaN(n)) onContributionChange(n);
            }}
            keyboardType="numeric"
            placeholderTextColor={COLORS.textMuted}
            selectionColor={COLORS.primary}
          />
        </View>
      </View>

      <View style={styles.field}>
        <View style={styles.sliderHeader}>
          <Text style={styles.label}>Projection Period</Text>
          <Text style={styles.yearsValue}>{years} years</Text>
        </View>
        {Platform.OS === 'web' ? (
          <WebSlider value={years} min={1} max={40} step={1} onChange={onYearsChange} />
        ) : (
          <NativeStepper value={years} min={1} max={40} step={1} onChange={onYearsChange} />
        )}
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>1 yr</Text>
          <Text style={styles.sliderLabel}>20 yrs</Text>
          <Text style={styles.sliderLabel}>40 yrs</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.regular,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currencyToggle: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: RADIUS.button,
  },
  currencyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  field: { gap: 8 },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 48,
    gap: 4,
  },
  currencySymbol: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yearsValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnPressed: {
    opacity: 0.7,
  },
  stepBtnText: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
});
