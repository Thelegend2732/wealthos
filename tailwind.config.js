/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        'bg-elevated': '#0E0E1A',
        surface: '#13131A',
        'surface-elevated': '#1A1A24',
        border: '#1E1E2E',
        'border-strong': '#2A2A38',
        primary: { DEFAULT: '#6C63FF', light: '#8B83FF', dark: '#5048D9' },
        success: { DEFAULT: '#00D4AA', light: '#26E5BD' },
        danger: { DEFAULT: '#FF4757', light: '#FF6B7A' },
        accent: { DEFAULT: '#FF8C42', light: '#FFA666' },
        text: {
          primary: '#FFFFFF',
          secondary: '#8B8FA8',
          muted: '#4A4A6A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: { '0%, 100%': { opacity: '0.4' }, '50%': { opacity: '0.7' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 32px -8px rgba(108, 99, 255, 0.4)',
        'glow-success': '0 0 32px -8px rgba(0, 212, 170, 0.4)',
        'card': '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -8px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
};
