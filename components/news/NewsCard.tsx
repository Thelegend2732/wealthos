import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { NewsItem } from '../../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '../../constants/theme';

interface Props {
  item: NewsItem;
  onRead: (id: string) => void;
}

const CATEGORY_META = {
  finance: { label: 'Finance', color: COLORS.primary },
  tech: { label: 'Tech', color: COLORS.success },
  lifestyle: { label: 'Lifestyle', color: COLORS.accent },
} as const;

function relativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export default function NewsCard({ item, onRead }: Props) {
  const meta = CATEGORY_META[item.category];

  const handlePress = async () => {
    onRead(item.id);
    await WebBrowser.openBrowserAsync(item.url);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      style={[styles.card, item.isRead && styles.cardRead]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.badge, { backgroundColor: `${meta.color}20` }]}>
            <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          <Text style={styles.source}>{item.source}</Text>
          <Text style={styles.time}>{relativeTime(item.publishedAt)}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.textBlock}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
          </View>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
              <Text style={styles.placeholderIcon}>
                {item.category === 'finance' ? '📈' : item.category === 'tech' ? '🔬' : '⌚'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardRead: {
    opacity: 0.55,
  },
  content: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.pill,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.3,
  },
  source: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  time: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  body: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  textBlock: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    fontWeight: FONT_WEIGHT.bold,
    lineHeight: 21,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.badge,
    flexShrink: 0,
  },
  thumbnailPlaceholder: {
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: 28,
  },
});
