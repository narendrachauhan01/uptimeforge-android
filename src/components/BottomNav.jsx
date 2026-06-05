import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/dashboard', icon: '⊞', label: 'Home' },
  { path: '/sites',     icon: '📡', label: 'Sites' },
  { path: '/add-site',  icon: '＋', label: 'Add' },
  { path: '/profile',   icon: '👤', label: 'Profile' },
];

export default function BottomNav() {
  const nav = useNavigate();
  const loc = useLocation();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#120d30',
      borderTop: '1px solid #2d1f6e',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom, 8px)',
      zIndex: 100,
    }}>
      {tabs.map(t => {
        const active = loc.pathname === t.path || (t.path !== '/dashboard' && loc.pathname.startsWith(t.path));
        const isAdd = t.path === '/add-site';
        return (
          <button key={t.path} onClick={() => nav(t.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '10px 0', background: 'none', border: 'none',
              cursor: 'pointer', gap: 4,
            }}>
            {isAdd ? (
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: '#7c3aed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, color: '#fff', marginTop: -20,
                boxShadow: '0 4px 16px #7c3aed66',
              }}>{t.icon}</div>
            ) : (
              <span style={{ fontSize: 20, filter: active ? 'none' : 'grayscale(1) opacity(0.5)' }}>{t.icon}</span>
            )}
            {!isAdd && (
              <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#a78bfa' : '#4a4070' }}>
                {t.label}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
