import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePortfolio } from '../../hooks/usePortfolio';
import PortfolioSummary from '../../components/portfolio/PortfolioSummary';
import PortfolioPieChart from '../../components/portfolio/PortfolioPieChart';
import CategoryBreakdown from '../../components/portfolio/CategoryBreakdown';
import AssetCard from '../../components/portfolio/AssetCard';
import { ChartErrorBoundary } from '../../components/ChartErrorBoundary';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../../constants/theme';
import { PriceData } from '../../types';

function relativeTime(date: Date | null): string {
  if (!date) return 'Never updated';
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export default function PortfolioScreen() {
  const {
    filteredAssets,
    prices,
    lastUpdated,
    isLoading,
    totalValue,
    totalInvested,
    pnl,
    todayChange,
    categoryBreakdown,
    selectedCategory,
    setSelectedCategory,
    refresh,
  } = usePortfolio();

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>WealthOS</Text>
            <Text style={styles.updated}>Updated {relativeTime(lastUpdated)}</Text>
          </View>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
            <Ionicons name="refresh" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <PortfolioSummary
          totalValue={totalValue}
          totalInvested={totalInvested}
          pnl={pnl}
          todayChange={todayChange}
          isLoading={isLoading}
        />

        {/* Pie Chart */}
        <ChartErrorBoundary fallbackLabel="Pie chart unavailable">
          <PortfolioPieChart
            breakdown={categoryBreakdown}
            totalValue={totalValue}
          />
        </ChartErrorBoundary>

        {/* Category Breakdown */}
        <CategoryBreakdown
          breakdown={categoryBreakdown}
          totalValue={totalValue}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Asset List header */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {selectedCategory ? `${filteredAssets.length} position${filteredAssets.length !== 1 ? 's' : ''}` : 'All Positions'}
          </Text>
        </View>

        {/* Asset Cards */}
        <View style={styles.assetList}>
          {filteredAssets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              priceData={prices[asset.symbol] as (PriceData & { isDelayed?: boolean }) | undefined}
            />
          ))}
          {filteredAssets.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No positions in this category</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    paddingBottom: 32,
    gap: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  appName: {
    fontSize: FONT_SIZE.xxl,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: -0.5,
  },
  updated: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listHeader: {
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  assetList: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textMuted,
  },
});
