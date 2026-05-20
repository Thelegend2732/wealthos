/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        surface: '#13131A',
        border: '#1E1E2E',
        primary: '#6C63FF',
        success: '#00D4AA',
        danger: '#FF4757',
        accent: '#FF8C42',
        textPrimary: '#FFFFFF',
        textSecondary: '#8B8FA8',
      },
    },
  },
  plugins: [],
};
