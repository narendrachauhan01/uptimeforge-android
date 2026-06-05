import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

function UptimeBar({ history = [] }) {
  const SLOTS = 30;
  const padded = history.length >= SLOTS ? history.slice(-SLOTS) : [
    ...Array(SLOTS - history.length).fill({ status: 'empty' }),
    ...history,
  ];
  const upPct = history.length ? Math.round((history.filter(h => h.status === 'up').length / history.length) * 100) : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
      <div style={{ display: 'flex', gap: 1.5 }}>
        {padded.map((h, i) => (
          <div key={i} style={{
            width: 5, height: 20, borderRadius: 2,
            background: h.status === 'up' ? '#10b981' : h.status === 'down' ? '#ef4444' : '#2d1f6e',
            opacity: h.status === 'empty' ? 0.3 : 0.9,
          }} />
        ))}
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color: upPct === null ? '#6b7280' : upPct >= 99 ? '#10b981' : upPct >= 90 ? '#f59e0b' : '#ef4444' }}>
        {upPct !== null ? `${upPct}%` : '—'}
      </span>
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
      borderRadius: 14, border: `1px solid ${isDown ? '#7f1d1d88' : '#2d1f6e'}`,
      marginBottom: 10, cursor: 'pointer',
    }}>
      <div className={`dot dot-${isUp ? 'up' : isDown ? 'down' : 'paused'}`} style={{ width: 10, height: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {site.name || site.url}
        </div>
        <div style={{ fontSize: 12, color: '#8b7fb8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {site.url}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: isUp ? '#10b981' : isDown ? '#ef4444' : '#f59e0b' }}>
          {isUp ? 'UP' : isDown ? 'DOWN' : '?'}
        </div>
        {site.responseTime && <div style={{ fontSize: 10, color: '#8b7fb8' }}>{site.responseTime}ms</div>}
      </div>
      <UptimeBar history={site.historyBar || []} />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/servers');
      setSites(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const checkNow = async () => {
    setChecking(true);
    try { await api.post('/api/servers/check-now'); setTimeout(load, 3000); }
    catch {} finally { setTimeout(() => setChecking(false), 3000); }
  };

  const up = sites.filter(s => s.status === 'up').length;
  const down = sites.filter(s => s.status === 'down').length;
  const allHistory = sites.flatMap(s => s.historyBar || []);
  const uptime = allHistory.length
    ? Math.round((allHistory.filter(h => h.status === 'up').length / allHistory.length) * 100 * 10) / 10
    : null;

  const planColors = { free_trial: '#6d28d9', bronze: '#92400e', silver: '#374151', gold: '#78350f' };
  const planBg    = { free_trial: '#3b0764',  bronze: '#451a03', silver: '#1f2937', gold: '#422006' };
  const accountStatus = user?.accountStatus || 'active';

  return (
    <div className="page">
      {accountStatus === 'grace' && (
        <div style={{ background: 'linear-gradient(90deg,#92400e,#d97706)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>🔔 Subscription Expired — Grace Period</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Monitoring paused · Renew within 10 days</div>
          </div>
          <button onClick={() => nav('/plans')} style={{ background: '#fff', color: '#b45309', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Renew</button>
        </div>
      )}

      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg,#1a0a4e 0%,#0f0a1e 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: '#8b7fb8', fontSize: 13, marginBottom: 4 }}>Good day,</p>
            <h1 style={{ fontSize: 22, fontWeight: 800 }}>{user?.name?.split(' ')[0]} 👋</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={checkNow} disabled={checking} style={{
              background: '#7c3aed22', border: '1px solid #7c3aed44', color: '#a78bfa',
              borderRadius: 10, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>{checking ? '⏳' : '↺ Check'}</button>
            <div style={{ background: planBg[user?.plan] || '#3b0764', border: `1px solid ${planColors[user?.plan] || '#6d28d9'}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#c084fc', textTransform: 'uppercase' }}>
              {user?.plan?.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <div style={{ background: '#1e1350', borderRadius: 14, padding: '14px 16px', flex: 1, border: '1px solid #2d1f6e' }}>
            <div style={{ fontSize: 11, color: '#8b7fb8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Total</div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{sites.length}</div>
          </div>
          <div style={{ background: '#064e3b22', borderRadius: 14, padding: '14px 16px', flex: 1, border: '1px solid #10b98122' }}>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Online</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981' }}>{up}</div>
          </div>
          <div style={{ background: '#7f1d1d22', borderRadius: 14, padding: '14px 16px', flex: 1, border: '1px solid #ef444422' }}>
            <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Down</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#ef4444' }}>{down}</div>
          </div>
        </div>

        {sites.length > 0 && (
          <div style={{ background: 'linear-gradient(135deg,#2d1760,#1e1350)', borderRadius: 16, padding: '20px', marginBottom: 20, border: '1px solid #3d2a80', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600, marginBottom: 8 }}>OVERALL UPTIME (LAST 24H)</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: uptime === null ? '#6b7280' : uptime >= 99 ? '#10b981' : uptime >= 90 ? '#f59e0b' : '#ef4444', lineHeight: 1 }}>
              {uptime !== null ? `${uptime}%` : '—'}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div className="section-title" style={{ margin: 0 }}>Your Sites</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => nav('/performance')} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>📊 Charts</button>
            <button onClick={() => nav('/sites')} style={{ background: 'none', border: 'none', color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>See all ›</button>
          </div>
        </div>

        {loading ? <div className="spinner" /> : sites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📡</div>
            <div className="empty-title">No sites yet</div>
            <div className="empty-desc">Add your first site to start monitoring</div>
            <button className="btn btn-primary" style={{ marginTop: 24, width: 'auto', padding: '12px 28px' }} onClick={() => nav('/add-site')}>+ Add Site</button>
          </div>
        ) : (
          sites.slice(0, 5).map(s => (
            <SiteRow key={s._id} site={s} onClick={() => nav(`/sites/${s._id}`)} />
          ))
        )}

        {user?.plan === 'free_trial' && (user?.trialDaysLeft ?? 999) <= 3 && (
          <div style={{ background: '#451a03', borderRadius: 14, padding: '16px', border: '1px solid #78350f', marginTop: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fbbf24', marginBottom: 6 }}>
              ⚠️ Trial expires in {user.trialDaysLeft} day{user.trialDaysLeft !== 1 ? 's' : ''}
            </div>
            <button className="btn btn-primary" style={{ width: 'auto', padding: '10px 24px' }} onClick={() => nav('/plans')}>Upgrade Now</button>
          </div>
        )}
      </div>
    </div>
  );
}
