import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

function StatCard({ label, value, color, bg }) {
  return (
    <div style={{ background: bg || '#1e1350', borderRadius: 14, padding: '14px 16px', flex: 1, border: '1px solid #2d1f6e' }}>
      <div style={{ fontSize: 11, color: '#8b7fb8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: color || '#fff' }}>{value}</div>
    </div>
  );
}

function SiteRow({ site, onClick }) {
  const isUp = site.status === 'up';
  const isDown = site.status === 'down';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', background: '#1e1350',
      borderRadius: 14, border: '1px solid #2d1f6e',
      marginBottom: 10, cursor: 'pointer',
    }}>
      <div className={`dot dot-${site.status === 'up' ? 'up' : site.status === 'down' ? 'down' : 'paused'}`}
        style={{ width: 10, height: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {site.name || site.url}
        </div>
        <div style={{ fontSize: 12, color: '#8b7fb8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {site.url}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: isUp ? '#10b981' : isDown ? '#ef4444' : '#f59e0b' }}>
          {isUp ? 'UP' : isDown ? 'DOWN' : 'PAUSED'}
        </div>
        {site.responseTime && (
          <div style={{ fontSize: 11, color: '#8b7fb8', marginTop: 2 }}>{site.responseTime}ms</div>
        )}
      </div>
      <div style={{ color: '#4a4070', fontSize: 16 }}>›</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/sites');
      setSites(data.sites || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const up = sites.filter(s => s.status === 'up').length;
  const down = sites.filter(s => s.status === 'down').length;
  const uptime = sites.length ? Math.round((up / sites.length) * 100) : null;

  const planColors = { free_trial: '#6d28d9', bronze: '#92400e', silver: '#374151', gold: '#78350f' };
  const planBg = { free_trial: '#3b0764', bronze: '#451a03', silver: '#1f2937', gold: '#422006' };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #1a0a4e 0%, #0f0a1e 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: '#8b7fb8', fontSize: 13, marginBottom: 4 }}>Good day,</p>
            <h1 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2 }}>{user?.name?.split(' ')[0]} 👋</h1>
          </div>
          <div style={{
            background: planBg[user?.plan] || '#3b0764',
            border: `1px solid ${planColors[user?.plan] || '#6d28d9'}`,
            borderRadius: 20, padding: '4px 12px',
            fontSize: 12, fontWeight: 700, color: '#c084fc',
            textTransform: 'uppercase',
          }}>
            {user?.plan?.replace('_', ' ')}
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <StatCard label="Total Sites" value={sites.length} />
          <StatCard label="Online" value={up} color="#10b981" bg="#064e3b22" />
          <StatCard label="Offline" value={down} color="#ef4444" bg="#7f1d1d22" />
        </div>

        {/* Overall uptime */}
        {sites.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #2d1760, #1e1350)',
            borderRadius: 16, padding: '20px', marginBottom: 20,
            border: '1px solid #3d2a80', textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600, marginBottom: 8 }}>OVERALL UPTIME</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: uptime >= 99 ? '#10b981' : uptime >= 90 ? '#f59e0b' : '#ef4444', lineHeight: 1 }}>
              {uptime !== null ? `${uptime}%` : '—'}
            </div>
            <div style={{ fontSize: 13, color: '#8b7fb8', marginTop: 8 }}>Last 24 hours</div>
          </div>
        )}

        {/* Sites */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="section-title" style={{ margin: 0 }}>Your Sites</div>
          <button onClick={() => nav('/sites')} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            See all ›
          </button>
        </div>

        {loading ? <div className="spinner" /> : sites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📡</div>
            <div className="empty-title">No sites yet</div>
            <div className="empty-desc">Add your first site to start monitoring</div>
            <button className="btn btn-primary" style={{ marginTop: 24, width: 'auto', padding: '12px 28px' }} onClick={() => nav('/add-site')}>
              + Add Site
            </button>
          </div>
        ) : (
          sites.slice(0, 5).map(s => (
            <SiteRow key={s._id} site={s} onClick={() => nav(`/sites/${s._id}`)} />
          ))
        )}

        {/* Trial banner */}
        {user?.plan === 'free_trial' && user?.trialDaysLeft <= 3 && (
          <div style={{
            background: '#451a03', borderRadius: 14, padding: '16px',
            border: '1px solid #78350f', marginTop: 16, textAlign: 'center',
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24', marginBottom: 6 }}>
              ⚠️ Trial expires in {user.trialDaysLeft} day{user.trialDaysLeft !== 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 13, color: '#d97706', marginBottom: 12 }}>Upgrade to keep monitoring</div>
            <button className="btn btn-primary btn-sm" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => nav('/plans')}>
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
