import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

// This file controls the HTML shell that wraps the entire Expo Router web app.
// It runs only during static rendering (build time) — not in the browser.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <title>WealthOS</title>
        <meta name="description" content="Personal investment tracker — portfolio, news and DCA planner" />
        {/* Ensures the ScrollView reset CSS is injected */}
        <ScrollViewStyleReset />
        {/* Dark background applied immediately before JS loads, preventing
            the white flash on page load. */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body, #root {
              height: 100%;
              margin: 0;
              padding: 0;
              background-color: #0A0A0F;
              color: #FFFFFF;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            * { box-sizing: border-box; }
          `,
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
