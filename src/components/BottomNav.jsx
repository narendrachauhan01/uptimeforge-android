import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

const tabs = [
  { path: '/dashboard', icon: '⊞',  label: 'Home' },
  { path: '/sites',     icon: '🌐',  label: 'Sites' },
  { path: '/add-site',  icon: '＋',  label: 'Add' },
  { path: '/alerts',    icon: '🔔',  label: 'Alerts' },
  { path: '/profile',   icon: '👤',  label: 'Profile' },
];

export default function BottomNav() {
  const nav = useNavigate();
  const loc = useLocation();
  const { user } = useAuth();
  const [downCount, setDownCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const check = () => {
      api.get('/api/servers').then(({ data }) => {
        const sites = Array.isArray(data) ? data : [];
        setDownCount(sites.filter(s => s.status === 'down').length);
      }).catch(() => {});
    };
    check();
    const id = setInterval(check, 60000);
    return () => clearInterval(id);
  }, [user]);

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
        const isAdd    = t.path === '/add-site';
        const isAlerts = t.path === '/alerts';
        return (
          <button key={t.path} onClick={() => nav(t.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '10px 0', background: 'none', border: 'none',
              cursor: 'pointer', gap: 3,
            }}>
            {isAdd ? (
              <div style={{
                width: 42, height: 42, borderRadius: '50%', background: '#7c3aed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, color: '#fff', marginTop: -18,
                boxShadow: '0 4px 16px #7c3aed66',
              }}>{t.icon}</div>
            ) : (
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <span style={{ fontSize: 20, filter: active ? 'none' : 'grayscale(1) opacity(0.5)' }}>{t.icon}</span>
                {isAlerts && downCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -5,
                    background: '#ef4444', color: '#fff',
                    borderRadius: '50%', minWidth: 16, height: 16,
                    fontSize: 9, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 2px', lineHeight: 1,
                  }}>
                    {downCount > 9 ? '9+' : downCount}
                  </span>
                )}
              </div>
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
