# WealthOS — Setup Guide

## Prerequisites

1. **Install Node.js** (v18 or later): https://nodejs.org/
2. **Install Expo CLI**: `npm install -g expo-cli`
3. **Install Expo Go** app on your phone (iOS App Store / Google Play)

## Quick Start

```bash
# Navigate to project
cd investment-app

# Install dependencies
npm install

# Start the development server
npx expo start
```

Scan the QR code with Expo Go on your phone.

## Environment Setup

Edit `.env.local` with your API keys:

```
EXPO_PUBLIC_ALPHA_VANTAGE_KEY=your_key_here
EXPO_PUBLIC_NEWS_API_KEY=your_key_here
```

### Get free API keys:
- **Alpha Vantage** (stock prices): https://www.alphavantage.co/support/#api-key
  - Free: 25 requests/day — the app caches aggressively to stay within limits
  - Use `demo` key to test with IBM only
- **NewsAPI** (news feed): https://newsapi.org/register
  - Free: 100 requests/day — the app caches 1 hour per category
  - Without a key, mock news articles are shown

## Features

### Portfolio Dashboard
- Real-time prices via Alpha Vantage (with Yahoo Finance fallback)
- 15-minute cache — pull to refresh anytime
- Category filter (Index Funds / ETFs / Stocks)
- P&L tracking vs average cost basis

### News Feed
- Three tabs: Finance, Tech & Semis, Lifestyle
- Read/unread state persisted locally
- 1-hour cache per category
- Opens articles in in-app browser

### DCA Planner
- Compound interest projections up to 40 years
- Three scenarios: Conservative (6%), Moderate (10%), Optimistic (15%)
- Contribution log with date and notes
- USD/EUR toggle

## Notes

- The app works offline — last fetched prices and news are cached in AsyncStorage
- Delayed prices are shown with a "DELAYED" badge when the cache is stale and API fails
- Initial portfolio (VOO, QQQ, SOXX, NVDA, ASML) is hardcoded as starting data
