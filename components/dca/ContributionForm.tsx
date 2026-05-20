import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
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

// ---------------------------------------------------------------------------
// Web-safe slider — renders a styled <input type="range"> on web, falls back
// to @react-native-community/slider on native (lazy-required to avoid Metro
// bundling issues on web where the native module isn't available).
// ---------------------------------------------------------------------------
interface SliderProps {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

function YearsSlider({ value, min, max, step, onChange }: SliderProps) {
  if (Platform.OS === 'web') {
    return (
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          height: 40,
          accentColor: COLORS.primary,
          cursor: 'pointer',
          background: 'transparent',
        }}
      />
    );
  }

  // Native — dynamically require so Metro doesn't break the web bundle
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Slider = require('@react-native-community/slider').default;
  return (
    <Slider
      minimumValue={min}
      maximumValue={max}
      step={step}
      value={value}
      onValueChange={onChange}
      minimumTrackTintColor={COLORS.primary}
      maximumTrackTintColor={COLORS.border}
      thumbTintColor={COLORS.primary}
      style={styles.slider}
    />
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
          <Text style={styles.currencyText}>{currency === 'USD' ? '🇺🇸 USD' : '🇪🇺 EUR'}</Text>
        </TouchableOpacity>
      </View>

      {/* Initial Capital */}
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

      {/* Monthly Contribution */}
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

      {/* Years Slider */}
      <View style={styles.field}>
        <View style={styles.sliderHeader}>
          <Text style={styles.label}>Projection Period</Text>
          <Text style={styles.yearsValue}>{years} years</Text>
        </View>
        <YearsSlider
          value={years}
          min={1}
          max={40}
          step={1}
          onChange={onYearsChange}
        />
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
  field: {
    gap: 8,
  },
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
  slider: {
    height: 40,
    marginHorizontal: -4,
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
