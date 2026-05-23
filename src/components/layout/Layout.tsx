import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-32 max-w-5xl w-full mx-auto px-5 sm:px-8">
        <Outlet />
      </main>
      <TabBar />
    </div>
  );
}
