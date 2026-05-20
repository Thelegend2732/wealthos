export const COLORS = {
  bg: '#0A0A0F',
  surface: '#13131A',
  surfaceElevated: '#1A1A24',
  border: '#1E1E2E',
  primary: '#6C63FF',
  success: '#00D4AA',
  danger: '#FF4757',
  accent: '#FF8C42',
  textPrimary: '#FFFFFF',
  textSecondary: '#8B8FA8',
  textMuted: '#4A4A6A',
} as const;

export const CATEGORY_COLORS = {
  'index-fund': '#6C63FF',
  etf: '#00D4AA',
  stock: '#FF8C42',
} as const;

export const CATEGORY_LABELS = {
  'index-fund': 'Index Funds',
  etf: 'ETFs',
  stock: 'Stocks',
} as const;

export const RADIUS = {
  card: 16,
  button: 12,
  badge: 8,
  pill: 20,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const FONT_WEIGHT = {
  regular: '400' as const,
  semibold: '600' as const,
  bold: '700' as const,
};
