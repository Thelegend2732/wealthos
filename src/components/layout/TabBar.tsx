import { NavLink } from 'react-router-dom';

interface Tab {
  to: string;
  label: string;
  icon: (active: boolean) => JSX.Element;
}

const PieIcon = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#6C63FF' : '#8B8FA8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const NewsIcon = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#6C63FF' : '#8B8FA8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6z" />
  </svg>
);

const TrendIcon = (active: boolean) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#6C63FF' : '#8B8FA8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const TABS: Tab[] = [
  { to: '/', label: 'Portfolio', icon: PieIcon },
  { to: '/news', label: 'News', icon: NewsIcon },
  { to: '/dca', label: 'DCA', icon: TrendIcon },
];

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="glass border-t border-border">
        <div className="max-w-6xl mx-auto px-2 sm:px-6 flex justify-around items-center h-[64px] pb-[env(safe-area-inset-bottom)]">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/'}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center gap-1 flex-1 h-full py-2 transition-all ${
                  isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary rounded-full" />
                  )}
                  {tab.icon(isActive)}
                  <span className="text-[11px] font-semibold tracking-wide">{tab.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
