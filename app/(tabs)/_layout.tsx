import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Slot, Link, usePathname } from 'expo-router';
import { COLORS, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

interface Tab {
  href: '/' | '/news' | '/dca';
  label: string;
  emoji: string;
}

const TABS: Tab[] = [
  { href: '/', label: 'Portfolio', emoji: '📊' },
  { href: '/news', label: 'News', emoji: '📰' },
  { href: '/dca', label: 'DCA', emoji: '📈' },
];

function isActive(pathname: string, href: Tab['href']): boolean {
  if (href === '/') return pathname === '/' || pathname === '';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function TabLayout() {
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const active = isActive(pathname, tab.href);
          const color = active ? COLORS.primary : COLORS.textSecondary;
          return (
            <Link key={tab.href} href={tab.href} asChild>
              <Pressable style={styles.tab}>
                <Text style={styles.emoji}>{tab.emoji}</Text>
                <Text style={[styles.label, { color }]}>{tab.label}</Text>
                {active && <View style={styles.activeIndicator} />}
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
    position: 'relative',
  },
  emoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    height: 2,
    width: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
});
