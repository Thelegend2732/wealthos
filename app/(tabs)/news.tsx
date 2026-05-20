import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNews } from '../../hooks/useNews';
import CategoryTabs from '../../components/news/CategoryTabs';
import NewsCard from '../../components/news/NewsCard';
import { NewsItem } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';

export default function NewsScreen() {
  const [activeTab, setActiveTab] = useState<NewsItem['category']>('finance');
  const { news, isLoading, isError, refresh, markAsRead } = useNews(activeTab);

  const renderItem = ({ item }: { item: NewsItem }) => (
    <NewsCard item={item} onRead={markAsRead} />
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.appName}>Markets</Text>
        <Text style={styles.subtitle}>Your financial news feed</Text>
      </View>

      <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {isLoading && news.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching latest news...</Text>
        </View>
      ) : isError && news.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.errorTitle}>Could not load news</Text>
          <Text style={styles.errorSub}>Check your API key or internet connection</Text>
          <TouchableOpacity onPress={() => refresh()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={news}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No articles found</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  appName: {
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
  list: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
  },
  errorSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.button,
    marginTop: SPACING.sm,
  },
  retryText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
  },
  emptyText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textMuted,
  },
});
