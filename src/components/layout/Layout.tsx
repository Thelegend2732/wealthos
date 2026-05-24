import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, BarChart2, Activity, User } from 'lucide-react';
import { useIsModalOpen } from '../../stores/uiStore';

const TABS = [
  { icon: Home,      label: 'Inicio',   route: '/' },
  { icon: BarChart2, label: 'Noticias', route: '/news' },
  { icon: Activity,  label: 'Análisis', route: '/analysis' },
  { icon: User,      label: 'Perfil',   route: '/settings' },
];

export function Layout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isModalOpen = useIsModalOpen();

  return (
    <div style={{
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a14 50%, #0a0f1e 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
      color: '#f1f5f9',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        input[type=range] { height: 4px; border-radius: 99px; }
      `}</style>

      {/* Mesh gradient blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: 200, right: -100, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: 120, left: 40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Scrollable content area — fills remaining height above the nav */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        /* No zIndex here: assigning zIndex:1 would create a stacking context
           that traps fixed-position modals below the nav's z-10 layer. */
        WebkitOverflowScrolling: 'touch' as React.CSSProperties['WebkitOverflowScrolling'],
        paddingBottom: 110,
      }}>
        <div style={{ maxWidth: 430, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>

      {/* Premium floating bottom nav — sits at the bottom of the flex column.
          Unmounted (not just hidden) whenever any modal is open, so we never
          have to fight the modal's z-index. */}
      {!isModalOpen && (
      <div style={{ position: 'relative', zIndex: 10, padding: '0 0 16px', flexShrink: 0 }}>
      <nav style={{
        margin: '8px auto 0',
        width: 'calc(100% - 48px)',
        maxWidth: 380,
        background: 'rgba(10,15,30,0.90)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: 24,
        padding: '12px 8px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.05)',
      }}>
        {TABS.map(({ icon: Icon, label, route }) => {
          const active = pathname === route;
          return (
            <button
              key={route}
              onClick={() => navigate(route)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                background: active ? 'rgba(16,185,129,0.12)' : 'transparent',
                border: active ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                borderRadius: 14, padding: '8px 12px',
                cursor: 'pointer', transition: 'all 0.2s',
                flex: 1, minWidth: 0,
              }}
            >
              <Icon size={20} color={active ? '#10b981' : '#475569'} />
              <span style={{ fontSize: 10, color: active ? '#10b981' : '#475569', letterSpacing: '0.04em', fontWeight: active ? 600 : 400 }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>
      </div>
      )}
    </div>
  );
}
