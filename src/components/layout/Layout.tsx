import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-24 max-w-6xl w-full mx-auto px-4 sm:px-6">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
