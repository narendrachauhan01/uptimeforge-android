import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Sites() {
  const nav = useNavigate();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/sites');
      setSites(data.sites || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const filters = ['all', 'up', 'down', 'paused'];
  const filtered = filter === 'all' ? sites : sites.filter(s => s.status === filter);

  return (
    <div className="page">
      {/* Header */}
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg, #1a0a4e 0%, #0f0a1e 100%)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Monitored Sites</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>{sites.length} site{sites.length !== 1 ? 's' : ''} total</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 20px', overflowX: 'auto' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
            background: filter === f ? '#7c3aed' : '#1e1350',
            color: filter === f ? '#fff' : '#8b7fb8',
            fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
            border: filter === f ? 'none' : '1px solid #2d1f6e',
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && ` (${sites.filter(s => s.status === f).length})`}
          </button>
        ))}
      </div>

      <div style={{ padding: '4px 20px' }}>
        {loading ? <div className="spinner" /> : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No sites found</div>
            <div className="empty-desc">{filter === 'all' ? 'Add your first site to start monitoring.' : `No ${filter} sites.`}</div>
            {filter === 'all' && (
              <button className="btn btn-primary" style={{ marginTop: 24, width: 'auto', padding: '12px 28px' }} onClick={() => nav('/add-site')}>
                + Add Site
              </button>
            )}
          </div>
        ) : filtered.map(site => (
          <div key={site._id} onClick={() => nav(`/sites/${site._id}`)} style={{
            background: '#1e1350', borderRadius: 14, padding: '16px',
            border: '1px solid #2d1f6e', marginBottom: 10, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div className={`dot dot-${site.status === 'up' ? 'up' : site.status === 'down' ? 'down' : 'paused'}`}
                style={{ width: 10, height: 10, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {site.name || site.url}
                </div>
                <div style={{ fontSize: 12, color: '#8b7fb8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {site.url}
                </div>
              </div>
              <span className={`badge badge-${site.status === 'up' ? 'up' : site.status === 'down' ? 'down' : 'paused'}`}>
                {site.status?.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              {site.uptimePercentage !== undefined && (
                <div>
                  <div style={{ fontSize: 11, color: '#8b7fb8', marginBottom: 2 }}>Uptime</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: site.uptimePercentage >= 99 ? '#10b981' : '#f59e0b' }}>
                    {site.uptimePercentage?.toFixed(2)}%
                  </div>
                </div>
              )}
              {site.responseTime && (
                <div>
                  <div style={{ fontSize: 11, color: '#8b7fb8', marginBottom: 2 }}>Response</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{site.responseTime}ms</div>
                </div>
              )}
              {site.interval && (
                <div>
                  <div style={{ fontSize: 11, color: '#8b7fb8', marginBottom: 2 }}>Check every</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{site.interval}s</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
