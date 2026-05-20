import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDCAStore } from '../../stores/dcaStore';
import ContributionForm from '../../components/dca/ContributionForm';
import ProjectionChart from '../../components/dca/ProjectionChart';
import ScenarioSlider from '../../components/dca/ScenarioSlider';
import { ChartErrorBoundary } from '../../components/ChartErrorBoundary';
import { ProjectionPoint } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';

function computeProjections(
  initialCapital: number,
  monthlyContribution: number,
  years: number
): ProjectionPoint[] {
  const totalMonths = years * 12;
  const points: ProjectionPoint[] = [];

  const rates = { conservative: 0.06 / 12, moderate: 0.10 / 12, optimistic: 0.15 / 12 };

  for (let n = 1; n <= totalMonths; n++) {
    const calc = (r: number) => {
      const fv = initialCapital * Math.pow(1 + r, n);
      const pmt = r > 0 ? monthlyContribution * ((Math.pow(1 + r, n) - 1) / r) : monthlyContribution * n;
      return fv + pmt;
    };

    points.push({
      month: n,
      conservative: calc(rates.conservative),
      moderate: calc(rates.moderate),
      optimistic: calc(rates.optimistic),
      totalContributed: initialCapital + monthlyContribution * n,
    });
  }

  return points;
}

function formatDate(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(value: number, currency: 'USD' | 'EUR'): string {
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'de-DE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DCAScreen() {
  const { config, contributions, updateConfig, addContribution, getTotalContributed } = useDCAStore();

  const [years, setYears] = useState(20);
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [showModal, setShowModal] = useState(false);
  const [modalAmount, setModalAmount] = useState('');
  const [modalNote, setModalNote] = useState('');

  const projections = useMemo(
    () => computeProjections(config.initialCapital, config.monthlyContribution, years),
    [config.initialCapital, config.monthlyContribution, years]
  );

  const finalPoint = projections[projections.length - 1];

  const handleAddContribution = useCallback(() => {
    const amount = parseFloat(modalAmount);
    if (isNaN(amount) || amount <= 0) return;
    addContribution(amount, new Date(), modalNote || undefined);
    setModalAmount('');
    setModalNote('');
    setShowModal(false);
  }, [modalAmount, modalNote, addContribution]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>DCA Planner</Text>
            <Text style={styles.subtitle}>Dollar-Cost Averaging Tracker</Text>
          </View>
        </View>

        {/* Config Form */}
        <ContributionForm
          initialCapital={config.initialCapital}
          monthlyContribution={config.monthlyContribution}
          years={years}
          currency={currency}
          onCapitalChange={(v) => updateConfig({ initialCapital: v })}
          onContributionChange={(v) => updateConfig({ monthlyContribution: v })}
          onYearsChange={setYears}
          onCurrencyToggle={() => setCurrency((c) => (c === 'USD' ? 'EUR' : 'USD'))}
        />

        {/* Projection Chart */}
        <ChartErrorBoundary fallbackLabel="Line chart unavailable">
          <ProjectionChart projections={projections} currency={currency} />
        </ChartErrorBoundary>

        {/* Summary Cards */}
        <ScenarioSlider
          finalPoint={finalPoint}
          currency={currency}
          initialCapital={config.initialCapital}
          monthlyContribution={config.monthlyContribution}
          years={years}
        />

        {/* DCA Log */}
        <View style={styles.logSection}>
          <View style={styles.logHeader}>
            <View>
              <Text style={styles.logTitle}>Contribution Log</Text>
              <Text style={styles.logSub}>
                Total recorded: {formatCurrency(getTotalContributed(), currency)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              style={styles.addBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color={COLORS.textPrimary} />
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          {contributions.length === 0 ? (
            <View style={styles.emptyLog}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No contributions logged yet</Text>
              <Text style={styles.emptySubtext}>Tap "Add" to record a real investment</Text>
            </View>
          ) : (
            contributions.map((c) => (
              <View key={c.id} style={styles.logItem}>
                <View style={styles.logLeft}>
                  <Text style={styles.logAmount}>{formatCurrency(c.amount, currency)}</Text>
                  {c.note && <Text style={styles.logNote}>{c.note}</Text>}
                </View>
                <Text style={styles.logDate}>{formatDate(c.date instanceof Date ? c.date : new Date(c.date))}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Contribution Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Contribution</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Amount ({currency})</Text>
              <View style={styles.inputRow}>
                <Text style={styles.currencySymbol}>{currency === 'USD' ? '$' : '€'}</Text>
                <TextInput
                  style={styles.modalInput}
                  value={modalAmount}
                  onChangeText={setModalAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  selectionColor={COLORS.primary}
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Note (optional)</Text>
              <TextInput
                style={styles.noteInput}
                value={modalNote}
                onChangeText={setModalNote}
                placeholder="e.g. January DCA"
                placeholderTextColor={COLORS.textMuted}
                selectionColor={COLORS.primary}
              />
            </View>

            <TouchableOpacity
              onPress={handleAddContribution}
              style={styles.submitBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.submitText}>Save Contribution</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    gap: SPACING.md,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logSection: {
    marginHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logTitle: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
  },
  logSub: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.button,
  },
  addBtnText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
  },
  emptyLog: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  logItem: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logLeft: {
    gap: 2,
  },
  logAmount: {
    fontSize: FONT_SIZE.md,
    color: COLORS.success,
    fontWeight: FONT_WEIGHT.bold,
  },
  logNote: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  logDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
  },
  modalField: {
    gap: 8,
  },
  modalLabel: {
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
    height: 52,
    gap: 4,
  },
  currencySymbol: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  modalInput: {
    flex: 1,
    fontSize: FONT_SIZE.xl,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
  },
  noteInput: {
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 48,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.button,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  submitText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
  },
});
