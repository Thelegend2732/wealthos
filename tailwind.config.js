/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Background hierarchy — slate-tinted dark grays, never pure black
        bg: '#0B0F1A',
        'bg-elevated': '#0F1424',
        surface: '#111827',
        'surface-elevated': '#161E2E',
        'surface-hover': '#1A2335',

        // Borders — semi-transparent for subtlety
        border: 'rgba(148, 163, 184, 0.08)',
        'border-strong': 'rgba(148, 163, 184, 0.16)',
        'border-active': 'rgba(148, 163, 184, 0.24)',

        // Text — slate scale
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
          faint: '#475569',
        },

        // Single accent — refined indigo (replaces the bright purple)
        primary: {
          DEFAULT: '#818CF8',
          hover: '#6366F1',
          subtle: 'rgba(129, 140, 248, 0.12)',
        },

        // P&L semantics — emerald for positive, soft red for negative
        success: {
          DEFAULT: '#10B981',
          subtle: 'rgba(16, 185, 129, 0.12)',
          text: '#34D399',
        },
        danger: {
          DEFAULT: '#F87171',
          subtle: 'rgba(248, 113, 113, 0.12)',
          text: '#FCA5A5',
        },

        // Category palette — cohesive muted hues that don't conflict
        // with the P&L semantics (emerald/red are reserved)
        cat: {
          'index-fund': '#A78BFA',
          etf: '#22D3EE',
          stock: '#FBBF24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      fontSize: {
        // Custom display sizes for financial numbers
        'display-xl': ['3.5rem', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '600' }],
        'display-lg': ['2.5rem', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '600' }],
        'display-md': ['1.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
      },
      letterSpacing: {
        'tight-2': '-0.02em',
        'tight-3': '-0.03em',
        'overline': '0.12em',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'shimmer': 'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
