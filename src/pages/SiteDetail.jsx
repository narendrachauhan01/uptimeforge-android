import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../App';

export default function SiteDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { showToast } = useAuth();
  const [site, setSite] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const load = useCallback(async () => {
    try {
      const [siteRes, histRes] = await Promise.all([
        api.get(`/api/servers/${id}`),
        api.get(`/api/servers/${id}/history?range=24h`).catch(() => ({ data: { history: [] } })),
      ]);
      setSite(siteRes.data);
      setHistory(histRes.data.history || []);
    } catch { nav('/sites'); }
    finally { setLoading(false); }
  }, [id, nav]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const deleteSite = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/servers/${id}`);
      showToast('Site deleted');
      nav('/sites');
    } catch { showToast('Failed to delete', 'error'); setDeleting(false); }
  };

  if (loading) return <div className="spinner" style={{ marginTop: '45vh' }} />;
  if (!site) return null;

  const isUp = site.status === 'up';
  const isDown = site.status === 'down';

  const chartData = history.slice(-50).map((h, i) => ({
    i, rt: h.responseTime || 0, status: h.status,
    time: h.time ? new Date(h.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '',
  }));

  const sslDays = site.sslDaysLeft ?? null;
  const domainDays = site.domainExpiry ? Math.floor((new Date(site.domainExpiry) - Date.now()) / 86400000) : null;
  const sslColor = sslDays === null ? '#6b7280' : sslDays <= 7 ? '#ef4444' : sslDays <= 30 ? '#f59e0b' : '#10b981';
  const domColor = domainDays === null ? '#6b7280' : domainDays <= 30 ? '#ef4444' : domainDays <= 60 ? '#f59e0b' : '#10b981';

  return (
    <div className="page">
      <div style={{
        padding: '52px 20px 20px',
        background: isUp ? 'linear-gradient(180deg,#064e3b 0%,#0f0a1e 100%)' : isDown ? 'linear-gradient(180deg,#7f1d1d 0%,#0f0a1e 100%)' : 'linear-gradient(180deg,#1a0a4e 0%,#0f0a1e 100%)',
      }}>
        <button onClick={() => nav('/sites')} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 15, marginBottom: 12, padding: 0 }}>
          ← Sites
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{site.name || 'Untitled'}</h1>
            <p style={{ color: '#8b7fb8', fontSize: 13, wordBreak: 'break-all' }}>{site.url}</p>
          </div>
          <span className={`badge badge-${isUp ? 'up' : isDown ? 'down' : 'paused'}`} style={{ marginLeft: 12, flexShrink: 0, fontSize: 13 }}>
            ● {site.status?.toUpperCase()}
          </span>
        </div>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, background: '#1e1350', borderRadius: 14, padding: '14px', border: '1px solid #2d1f6e', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#8b7fb8', fontWeight: 600, marginBottom: 4 }}>UPTIME</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{site.uptime24h != null ? `${site.uptime24h.toFixed(1)}%` : '—'}</div>
          </div>
          <div style={{ flex: 1, background: '#1e1350', borderRadius: 14, padding: '14px', border: '1px solid #2d1f6e', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#8b7fb8', fontWeight: 600, marginBottom: 4 }}>RESPONSE</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{site.responseTime ?? '—'}<span style={{ fontSize: 12, color: '#8b7fb8' }}>ms</span></div>
          </div>
          <div style={{ flex: 1, background: '#1e1350', borderRadius: 14, padding: '14px', border: '1px solid #2d1f6e', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#8b7fb8', fontWeight: 600, marginBottom: 4 }}>INTERVAL</div>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{site.checkInterval ?? '—'}<span style={{ fontSize: 12, color: '#8b7fb8' }}>s</span></div>
          </div>
        </div>

        {/* Response time chart */}
        {chartData.length > 1 && (
          <div style={{ background: '#1e1350', borderRadius: 14, padding: '16px', border: '1px solid #2d1f6e', marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Response Time (24h)</div>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="rt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#1a1040', border: '1px solid #2d1f6e', borderRadius: 8, fontSize: 11 }}
                  formatter={v => [`${v}ms`, 'Response']}
                  labelFormatter={l => l}
                />
                <Area type="monotone" dataKey="rt" stroke="#7c3aed" strokeWidth={2} fill="url(#rt)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* SSL & Domain */}
        {(sslDays !== null || domainDays !== null) && (
          <div style={{ background: '#1e1350', borderRadius: 14, padding: '16px', border: '1px solid #2d1f6e', marginBottom: 16 }}>
            <div className="section-title">SSL & Domain</div>
            <div style={{ display: 'flex', gap: 16 }}>
              {sslDays !== null && (
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#8b7fb8', marginBottom: 4 }}>SSL EXPIRY</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: sslColor }}>{sslDays}d</div>
                  {site.sslExpiry && <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{new Date(site.sslExpiry).toLocaleDateString('en-IN')}</div>}
                </div>
              )}
              {domainDays !== null && (
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#8b7fb8', marginBottom: 4 }}>DOMAIN EXPIRY</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: domColor }}>{domainDays}d</div>
                  {site.domainExpiry && <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{new Date(site.domainExpiry).toLocaleDateString('en-IN')}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alert methods */}
        <div style={{ background: '#1e1350', borderRadius: 14, padding: '16px', border: '1px solid #2d1f6e', marginBottom: 16 }}>
          <div className="section-title">Alert Methods</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {site.alertEmail    && <span className="badge" style={{ background: '#1e3a5f', color: '#60a5fa' }}>📧 Email</span>}
            {site.alertWhatsapp && <span className="badge" style={{ background: '#064e3b', color: '#34d399' }}>💬 WhatsApp</span>}
            {site.alertWebhook  && <span className="badge" style={{ background: '#1e1350', color: '#a78bfa' }}>🔗 Webhook</span>}
            {!site.alertEmail && !site.alertWhatsapp && !site.alertWebhook &&
              <span style={{ color: '#8b7fb8', fontSize: 13 }}>No alerts configured</span>}
          </div>
        </div>

        {/* Last checked */}
        {site.lastChecked && (
          <p style={{ fontSize: 12, color: '#4a4070', marginBottom: 16, textAlign: 'center' }}>
            Last checked: {new Date(site.lastChecked).toLocaleString('en-IN')}
          </p>
        )}

        {/* Delete */}
        {!showConfirm ? (
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>🗑 Delete Site</button>
        ) : (
          <div style={{ background: '#7f1d1d22', borderRadius: 14, padding: '16px', border: '1px solid #7f1d1d44' }}>
            <p style={{ color: '#ef4444', fontSize: 14, fontWeight: 600, marginBottom: 12, textAlign: 'center' }}>
              Delete "{site.name || site.url}"?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={deleteSite} disabled={deleting}>
                {deleting ? '⏳ Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
