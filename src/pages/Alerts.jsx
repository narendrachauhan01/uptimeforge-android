import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

function AlertCard({ alert }) {
  const isDown = alert.type === 'down' || alert.event === 'down';
  const isUp = alert.type === 'up' || alert.event === 'up' || alert.type === 'recovery';
  const isPing = alert.source === 'ping';

  const color = isUp ? '#10b981' : isDown ? '#ef4444' : '#f59e0b';
  const bg = isUp ? '#064e3b22' : isDown ? '#7f1d1d22' : '#78350f22';
  const label = isUp ? 'RECOVERED' : isDown ? 'DOWN' : (alert.type || alert.event || '').toUpperCase();

  const time = alert.createdAt
    ? new Date(alert.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div style={{
      background: '#1e1350', borderRadius: 14, border: '1px solid #2d1f6e',
      padding: '14px 16px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#e2d9f3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isPing ? '🏓 ' : '🌐 '}{alert.siteName || alert.targetName || alert.url || 'Unknown'}
          </div>
          <div style={{ fontSize: 12, color: '#8b7fb8', marginTop: 3 }}>{time}</div>
        </div>
        <span style={{ background: bg, color, border: `1px solid ${color}44`, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
          {label}
        </span>
      </div>
      {alert.message && (
        <div style={{ fontSize: 12, color: '#6b5fa8', marginTop: 4 }}>{alert.message}</div>
      )}
    </div>
  );
}

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/alerts?limit=100');
      setAlerts(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  const filtered = filter === 'all' ? alerts
    : filter === 'down' ? alerts.filter(a => a.type === 'down' || a.event === 'down')
    : alerts.filter(a => a.type === 'up' || a.event === 'up' || a.type === 'recovery');

  const FilterTab = ({ value, label }) => (
    <button onClick={() => setFilter(value)} style={{
      flex: 1, padding: '9px 0', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600,
      background: filter === value ? '#7c3aed' : 'transparent',
      color: filter === value ? '#fff' : '#8b7fb8',
    }}>{label}</button>
  );

  return (
    <div className="page">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #1a0a4e 0%, #0f0a1e 100%)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Incidents</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>Alert history for all monitors</p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', background: '#1e1350', borderRadius: 12, padding: 4, gap: 4, marginBottom: 16 }}>
          <FilterTab value="all" label={`All (${alerts.length})`} />
          <FilterTab value="down" label="Down" />
          <FilterTab value="up" label="Recovered" />
        </div>

        {loading ? <div className="spinner" /> : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <div className="empty-title">No incidents</div>
            <div className="empty-desc">All your monitors are healthy</div>
          </div>
        ) : (
          filtered.map((a, i) => <AlertCard key={a._id || i} alert={a} />)
        )}
      </div>
    </div>
  );
}
