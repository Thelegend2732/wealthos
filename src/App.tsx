import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { PortfolioPage } from './pages/PortfolioPage';
import { NewsPage } from './pages/NewsPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { SettingsPage } from './pages/SettingsPage';
import { useFocusRefresh } from './hooks/useFocusRefresh';

export default function App() {
  // Refetch prices + news + FX whenever the tab comes back to the foreground.
  useFocusRefresh();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<PortfolioPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
