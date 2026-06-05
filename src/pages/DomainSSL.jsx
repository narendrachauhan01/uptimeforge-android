import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../App';

function daysLeft(date) {
  if (!date) return null;
  return Math.floor((new Date(date) - Date.now()) / 86400000);
}

function ExpiryBadge({ days, label }) {
  if (days === null) return <span style={{ fontSize: 12, color: '#6b7280' }}>—</span>;
  const color = days <= 7 ? '#ef4444' : days <= 30 ? '#f59e0b' : '#10b981';
  const bg = days <= 7 ? '#7f1d1d22' : days <= 30 ? '#78350f22' : '#064e3b22';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 9, color: '#8b7fb8', fontWeight: 600, textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
      <span style={{ background: bg, color, border: `1px solid ${color}44`, borderRadius: 8, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>
        {days}d
      </span>
    </div>
  );
}

export default function DomainSSL() {
  const { showToast } = useAuth();
  const nav = useNavigate();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState({});

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/servers');
      setSites(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const checkExpiry = async (site) => {
    setChecking(p => ({ ...p, [site._id]: true }));
    try {
      const { data } = await api.get(`/api/expiry/${site._id}`);
      showToast(`${site.name}: SSL ${data.ssl?.daysLeft ?? '?'}d, Domain ${data.domain?.daysLeft ?? '?'}d`);
      load();
    } catch (err) {
      showToast(err.displayMessage || 'Check failed', 'error');
    } finally {
      setChecking(p => ({ ...p, [site._id]: false }));
    }
  };

  return (
    <div className="page">
      <div style={{ padding: '52px 20px 16px', background: 'linear-gradient(180deg,#1a0a4e 0%,#0f0a1e 100%)' }}>
        <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: 14, marginBottom: 8, padding: 0 }}>← Back</button>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>SSL & Domain</h1>
        <p style={{ color: '#8b7fb8', fontSize: 13, marginTop: 4 }}>Monitor SSL certificates & domain expiry</p>
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          {[['#10b981', '>30 days'], ['#f59e0b', '7-30 days'], ['#ef4444', '<7 days']].map(([color, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ fontSize: 11, color: '#8b7fb8' }}>{label}</span>
            </div>
          ))}
        </div>

        {loading ? <div className="spinner" /> : sites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔒</div>
            <div className="empty-title">No sites yet</div>
            <div className="empty-desc">Add sites to monitor SSL & domain expiry</div>
          </div>
        ) : sites.map(site => {
          const ssl = daysLeft(site.sslExpiry);
          const domain = daysLeft(site.domainExpiry);
          return (
            <div key={site._id} style={{ background: '#1e1350', borderRadius: 14, border: '1px solid #2d1f6e', padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.name || site.url}</div>
                  <div style={{ fontSize: 11, color: '#8b7fb8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{site.url}</div>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginLeft: 12 }}>
                  <ExpiryBadge days={ssl} label="SSL" />
                  <ExpiryBadge days={domain} label="Domain" />
                  <button
                    onClick={() => checkExpiry(site)}
                    disabled={checking[site._id]}
                    style={{ background: '#7c3aed22', border: '1px solid #7c3aed44', color: '#a78bfa', borderRadius: 8, padding: '6px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                  >
                    {checking[site._id] ? '...' : '↺'}
                  </button>
                </div>
              </div>
              {ssl !== null && ssl <= 30 && (
                <div style={{ marginTop: 8, fontSize: 11, color: ssl <= 7 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>
                  ⚠️ SSL expires {ssl <= 0 ? 'today!' : `in ${ssl} days`}
                  {site.sslExpiry && ` (${new Date(site.sslExpiry).toLocaleDateString('en-IN')})`}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
